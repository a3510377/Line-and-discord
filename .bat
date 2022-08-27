@ECHO OFF

docker build -t line-and-discord -f Dockerfile .
docker tag line-and-discord a3510377/line-and-discord
docker push a3510377/line-and-discord

docker build -t line-and-discord:linux-arm64 -f Dockerfile --platform linux/arm64 .
docker tag line-and-discord:linux-arm64 a3510377/line-and-discord:linux-arm64
docker push a3510377/line-and-discord:linux-arm64
