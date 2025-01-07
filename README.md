# Slack Counting Game Bot

A fun and interactive Slack bot that manages a collaborative counting game. Players take turns counting up, using simple numbers or complex mathematical expressions. The bot tracks stats, milestones, and user performance, encouraging friendly competition and mathematical creativity.

## Features

- Start counting from any number
- Support for complex mathematical expressions
- User stats tracking (successful counts, accuracy, average complexity)
- Milestones and achievements

## Development

This bot is a fork of https://github.com/carmex/SlackCountingBot, which was developed as an experiment to test the capabilities of [Cursor](https://www.cursor.so/), an AI-powered coding assistant. However, this fork is not made by Cursor. I made quite a lot of changes to the game logic etc.

## Getting Started

To set up and run the Slack Counting Game Bot, follow these steps:

1. Clone this repository:
   ```bash
   git clone https://github.com/QinCai-rui/SlackCountingBot.git
   cd SlackCountingBot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Slack App:
   - Go to [https://api.slack.com/apps](https://api.slack.com/apps) and create a new app
   - Add the necessary bot scopes (e.g., chat:write, reactions:write)
   - Install the app to your workspace

4. Set up environment variables:
   - Create a `.env` file in the project root
   - Add the following variables:
     ```bash
     SLACK_BOT_TOKEN=xoxb-your-bot-token
     SLACK_SIGNING_SECRET=your-signing-secret
     COUNTING_GAME_CHANNEL_ID=C0123456789
     ```

5. Start the bot:
   ```bash
   node app.js
   ```

6. Invite the bot to your designated counting channel in Slack

7. Start counting!

## Contributing

We welcome contributions to this project! If you have any ideas or suggestions, please open an issue or submit a pull request.

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

This license ensures that the software remains free and open source. It allows you to use, modify, and distribute the code, but any modifications or larger works based on this project must also be released under the same license.

## Acknowledgements

- [Discord Counting Bot](https://countingbot.supercrafter100.com/) by supercrafter100 for the inspiration
- [Cursor](https://www.cursor.so/) for assisting in the development of this project
