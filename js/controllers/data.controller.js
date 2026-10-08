// --- TAREFAS ---
async function addTask(title, date) {
  try {
    const task = await PortfyAPI.tasks.add({ t: title, d: date, done: 0 });
    D.tasks.push(task);
    render();
  } catch (err) {
    console.error('Erro ao adicionar tarefa:', err);
  }
}

async function toggleTask(id) {
  const t = D.tasks.find(x => x.id === id);
  if (!t) return;
  t.done = t.done ? 0 : 1;
  try {
    await PortfyAPI.tasks.update(id, t);
    render();
  } catch (err) {
    console.error('Erro ao atualizar tarefa:', err);
  }
}

async function removeTask(id) {
  try {
    await PortfyAPI.tasks.remove(id);
    D.tasks = D.tasks.filter(x => x.id !== id);
    render();
  } catch (err) {
    console.error('Erro ao remover tarefa:', err);
  }
}

// --- NOTAS ---
async function addNote(title, content) {
  try {
    const note = await PortfyAPI.notes.add({ title, content });
    D.notes.push(note);
    render();
  } catch (err) {
    console.error('Erro ao adicionar nota:', err);
  }
}

async function removeNote(id) {
  try {
    await PortfyAPI.notes.remove(id);
    D.notes = D.notes.filter(x => x.id !== id);
    render();
  } catch (err) {
    console.error('Erro ao remover nota:', err);
  }
}

// --- PROJETOS ---
async function addProject(projData) {
  try {
    const proj = await PortfyAPI.projects.add(projData);
    D.projs.push(proj);
    render();
  } catch (err) {
    console.error('Erro ao salvar projeto:', err);
  }
}
