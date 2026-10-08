// --- LOGIN ---
async function login(e) {
  if (e) e.preventDefault();
  const em = $('#l-em').value.trim().toLowerCase();
  const pw = $('#l-pw').value;

  if (!em || !pw) return err('Preencha e-mail e senha.');

  try {
    await PortfyAPI.signIn(em, pw);
    const data = await PortfyAPI.load();
    enter(data);
  } catch (error) {
    err(error.message || 'Erro ao realizar login.');
  }
}

// --- CADASTRO ---
async function register(e) {
  if (e) e.preventDefault();
  const name = $('#r-name').value.trim();
  const em = $('#r-em').value.trim().toLowerCase();
  const pw = $('#r-pw').value;

  if (!name || !em || !pw) return err('Preencha todos os campos.');

  try {
    await PortfyAPI.signUp(name, em, pw);
    show('diag'); // Direciona para o questionário de diagnóstico
  } catch (error) {
    err(error.message || 'Erro ao realizar cadastro.');
  }
}

// --- DIAGNÓSTICO ---
async function saveDiag(e) {
  if (e) e.preventDefault();
  const hours = $('#d-hours')?.value || 0;
  const phase = $('#d-phase')?.value || '';
  const market = $('#d-market')?.value || '';

  try {
    await PortfyAPI.saveDiagnostic([hours, phase, market]);
    const data = await PortfyAPI.load();
    enter(data);
  } catch (error) {
    err(error.message || 'Erro ao salvar diagnóstico.');
  }
}

// --- LOGOUT ---
async function logout() {
  try {
    await PortfyAPI.signOut();
    location.reload();
  } catch (error) {
    console.error('Erro ao sair:', error);
  }
}
