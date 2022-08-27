@ECHO OFF

docker build -t line-and-discord -f Dockerfile .
docker tag line-and-discord a3510377/line-and-discord
docker push a3510377/line-and-discord
