async function askAI(e) {
  if (e) e.preventDefault();
  const input = $('#ci');
  const text = input.value.trim();
  if (!text) return false;

  input.value = '';
  D.chat.push(['me', text]);
  D.chat.push(['ai', 'Digitando...']);
  render();

  try {
    const res = await PortfyAPI.askAI(text, D.conv);
    D.conv = res.conversation_id;
    D.chat[D.chat.length - 1] = ['ai', res.reply];
  } catch (err) {
    D.chat[D.chat.length - 1] = ['ai', err.message || 'Erro ao conectar à IA.'];
  }

  render();
  return false;
}
