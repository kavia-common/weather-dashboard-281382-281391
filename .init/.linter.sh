#!/bin/bash
cd /home/kavia/workspace/code-generation/weather-dashboard-281382-281391/weather_dashboard_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

