#!/bin/bash

##############################################################################
# ICON IMAGE CRM Dashboard — Health Check Script
## Telegram Bot Token (from @BotFather)
TELEGRAM_BOT_TOKEN="8671172763:AAE3XIgG-P6Nr57UU1dNKRh0K5FATbZPoWw"  
TELEGRAM_CHAT_ID=272576747
curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getUpdates" | jq '.'

curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
  -d "chat_id=$TELEGRAM_CHAT_ID" \
  --data-urlencode "text=Hello from my bot"