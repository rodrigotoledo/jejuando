#!/bin/bash

AVD_NAME="Medium_Phone_API_36.0"

# SDK (ajuste se precisar)
export ANDROID_SDK_ROOT="$HOME/Android/Sdk"
export PATH="$ANDROID_SDK_ROOT/emulator:$ANDROID_SDK_ROOT/platform-tools:$PATH"

# Wayland → XWayland (Qt via X11) ajuda a habilitar GPU
export QT_QPA_PLATFORM=xcb

LOG="$HOME/emulator.log"

start_emulator() {
  echo "[*] Iniciando $AVD_NAME com DNS Google..." | tee "$LOG"

  # tenta com Vulkan
  nohup emulator -avd "$AVD_NAME" -gpu vulkan -accel on \
    -dns-server 8.8.8.8,8.8.4.4 >> "$LOG" 2>&1 &
  PID=$!

  sleep 4
  if ! ps -p "$PID" >/dev/null 2>&1; then
    echo "[!] Vulkan falhou. Tentando -gpu host..." | tee -a "$LOG"
    nohup emulator -avd "$AVD_NAME" -gpu host -accel on \
      -dns-server 8.8.8.8,8.8.4.4 >> "$LOG" 2>&1 &
    PID=$!
    sleep 4
  fi

  if ! ps -p "$PID" >/dev/null 2>&1; then
    echo "[!] Host falhou. Tentando -gpu angle_indirect..." | tee -a "$LOG"
    nohup emulator -avd "$AVD_NAME" -gpu angle_indirect -accel on \
      -dns-server 8.8.8.8,8.8.4.4 >> "$LOG" 2>&1 &
    PID=$!
    sleep 4
  fi

  if ps -p "$PID" >/dev/null 2>&1; then
    echo "[✓] Emulador iniciado (pid $PID). Logs em $LOG"
    # tenta identificar o renderer após alguns segundos
    sleep 6
    RENDERER=$(grep -E "renderer|hwui.renderer" "$LOG" | tail -n 1)
    echo "[i] Renderer detectado: $RENDERER"
  else
    echo "[x] Não foi possível iniciar o emulador. Veja $LOG"
  fi
}

stop_emulator() {
  echo "[*] Encerrando emulador..."
  pkill -f "emulator.*$AVD_NAME" || true
  pkill -f "qemu-system" || true
  echo "[✓] Encerrado."
}

case "$1" in
  start)   start_emulator ;;
  stop)    stop_emulator ;;
  restart) stop_emulator; sleep 2; start_emulator ;;
  *) echo "Uso: $0 {start|stop|restart}"; exit 1 ;;
esac
