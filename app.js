require('dotenv').config();

const {App, ExpressReceiver} = require('@slack/bolt');
const {getStatsMessage, getHelpMessage} = require('./utils');
const statsManager = require('./statsManager');
const {processMessage} = require('./gameLogic');
const AsyncLock = require('async-lock');
const { i, detDependencies, efimovFactorDependencies, kron } = require('mathjs');

// Create a custom receiver
const receiver = new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    processBeforeResponse: true
});

// Create the Bolt app, using the custom receiver
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    receiver
});

// Handle the challenge request (Slack APP verification)
receiver.router.post('/', (req, res) => {
    if (req.body.type === 'url_verification') {
        res.send(req.body.challenge);
    } else {
        res.sendStatus(404);
    }
});

// Function to send error messages to the thread of the original message
async function sendErrorToSlack(error, client, channel, thread_ts) {
    await client.chat.postMessage({
        channel: channel,
        thread_ts: thread_ts,
        text: `An error occurred: \`\`\`${error}\`\`\``
    });
}

const lock = new AsyncLock();
const messageQueue = [];

// Function to process messages (both regular and !eval)
async function processAndRespond(message, say, client, isEval = false) {
    try {
        const result = await processMessage(message, say, client, isEval);
        if (isEval) {
            // For !eval, return the result explicitly to be handled by the calling function
            if (result) {
                return result;  // Return the result instead of calling say()
            } else {
                return "Invalid expression or operation not allowed.";
            }
        }
    } catch (error) {
        console.error('Error processing message:', error);
        if (isEval) {
            return `An error occurred while processing the expression.\n\`\`\`${error}\`\`\``;
        }
        // Send the error message to the thread of the original message
        await sendErrorToSlack(error, client, message.channel, message.ts);
    }
}

app.message(/^(?!!)[^!].*$/, async ({message, say, client}) => {
    if (message.channel !== process.env.COUNTING_GAME_CHANNEL_ID) return;

    messageQueue.push({message, say, client});

    // Process the queue
    lock.acquire('messageProcessing', async (done) => {
        while (messageQueue.length > 0) {
            const {message, say, client} = messageQueue.shift();
            await processAndRespond(message, say, client);
        }
        done();
    }, (err, ret) => {
        if (err) {
            console.error('Error processing message queue:', err);
        }
    });
});

app.command('/counting-stats', async ({command, ack, say, client}) => {
    await ack();
    const statsMessage = await getStatsMessage(client, statsManager.getStats());
    await client.chat.postEphemeral({
        channel: command.channel_id,
        user: command.user_id,
        text: statsMessage
    });
});

app.command('/counting-help', async ({command, ack, say, client}) => {
    await ack();
    await client.chat.postEphemeral({
        channel: command.channel_id,
        user: command.user_id,
        text: getHelpMessage()
    });
});

app.command('/counting-eval', async ({command, ack, say, client}) => {
    await ack();
    const evalExpression = command.text.trim(); // The expression to evaluate
    const evalMessage = {text: evalExpression, user: command.user_id};

    const result = await processAndRespond(evalMessage, say, client, true);
    if (result) {
        await client.chat.postEphemeral({
            channel: command.channel_id,
            user: command.user_id,
            text: result
        });
    }
});

app.message('!help', async ({message, say}) => {
    if (message.channel === process.env.COUNTING_GAME_CHANNEL_ID) {
        await say(getHelpMessage());
    }
});

app.message('!stats', async ({message, say, client}) => {
    if (message.channel === process.env.COUNTING_GAME_CHANNEL_ID) {
        const statsMessage = await getStatsMessage(client, statsManager.getStats());
        await client.chat.postEphemeral({
            channel: message.channel,
            user: message.user,
            text: statsMessage
        });
    }
});

// Add the !eval command
app.message(/^!eval (.+)$/, async ({message, say, client, context}) => {
    if (message.channel !== process.env.COUNTING_GAME_CHANNEL_ID) return;

    const evalExpression = context.matches[1].trim();
    const evalMessage = {...message, text: evalExpression};

    const result = await processAndRespond(evalMessage, say, client, true);
    if (result) {
        await client.chat.postEphemeral({
            channel: message.channel,
            user: message.user,
            text: result
        });
    }
});

(async () => {
    await statsManager.loadStats();
    await app.start(process.env.PORT || 3000);
    console.log('⚡️ Counting game bot is running!');
})();
