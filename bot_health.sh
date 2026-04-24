#!/bin/bash

##############################################################################
# ICON IMAGE CRM Dashboard — Health Check Script

  # ICON IMAGE Release Configuration
  -4922434210
  # umutykaya Release Configuration
  -1003825236260
  # Telegram Bot Token (from @BotFather)
  TELEGRAM_BOT_TOKEN=8671172763:AAE3XIgG-P6Nr57UU1dNKRh0K5FATbZPoWw
  
  # Telegram Chat ID for Varvara (from @userinfobot or @getidsbot)
  TELEGRAM_CHAT_ID=-4922434210
  TEST_TELEGRAM_CHAT_ID=-1003825236260
  
  # Deployed dashboard URL
  DASHBOARD_URL=https://icop.mountwavegroup.com/
  
##############################################################################
# https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getUpdates

curl -X GET "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getUpdates"

curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
  -d "chat_id=$TELEGRAM_CHAT_ID" \
  --data-urlencode "text=Hello from my bot"
