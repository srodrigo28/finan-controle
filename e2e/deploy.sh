#!/bin/bash
# Prova que a atualização do PWA acontece sozinha: build A -> app aberto -> build B -> a pessoa sai
# e volta -> tem que estar na versão B, sem desinstalar nada.
# Uso: bash e2e/deploy.sh   (precisa da API local em 127.0.0.1:8030)
set -u
cd /d/dev/finan-controle/web
export NEXT_PUBLIC_API_URL=http://127.0.0.1:8030

matar() { for pid in $(netstat -ano 2>/dev/null | grep ":3001 " | grep LISTENING | awk '{print $5}' | sort -u); do taskkill //PID "$pid" //F > /dev/null 2>&1; done; sleep 2; }
subir() { (npx next start -p 3001 > /dev/null 2>&1 &) ; until curl -s -o /dev/null http://127.0.0.1:3001/entrar; do sleep 1; done; }

rm -f e2e/.pronto-para-deploy e2e/.deploy-feito
echo "[1/5] build A"
NEXT_PUBLIC_VERSAO="A-1.0.0" npm run build > /dev/null 2>&1 || { echo "build A falhou"; exit 1; }
matar; subir; echo "[2/5] servidor A no ar"

node e2e/deploy.mjs > e2e/.saida-deploy 2>&1 &
TESTE=$!

for _ in $(seq 1 120); do [ -f e2e/.pronto-para-deploy ] && break; sleep 1; done
echo "[3/5] app aberto na versão A — publicando build B"
NEXT_PUBLIC_VERSAO="B-2.0.0" npm run build > /dev/null 2>&1 || { echo "build B falhou"; exit 1; }
matar; subir; echo "[4/5] servidor B no ar"
touch e2e/.deploy-feito

wait $TESTE
echo "[5/5] resultado:"
cat e2e/.saida-deploy
