const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'db.json');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Criar o banco de dados caso ainda não exista
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(
        DB_FILE,
        JSON.stringify({ alunos: [] }, null, 2)
    );
}

// Ler o banco de dados
function lerBancoDados() {
    const dados = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(dados);
}

// Salvar o banco de dados
function salvarBancoDados(dados) {
    fs.writeFileSync(DB_FILE, JSON.stringify(dados, null, 2));
}

// CREATE (POST)
app.post('/api/alunos', (req, res) => {
    const { nome, email, idade, curso } = req.body;

    if (
        !nome ||
        !email ||
        idade === undefined ||
        idade === null ||
        idade === '' ||
        !Number.isInteger(Number(idade)) ||
        Number(idade) < 1 ||
        !curso
    ) {
        return res.status(400).json({
            error: 'Informe nome, e-mail, idade válida e curso.'
        });
    }

    const db = lerBancoDados();

    const nextId = db.alunos.length > 0
        ? Math.max(...db.alunos.map(a => a.id)) + 1
        : 1;

    const novoAluno = {
        id: nextId,
        nome,
        email,
        idade: Number(idade),
        curso
    };

    db.alunos.push(novoAluno);
    salvarBancoDados(db);

    res.status(201).json(novoAluno);
});

// READ (GET)
app.get('/api/alunos', (req, res) => {
    const db = lerBancoDados();
    res.json(db.alunos);
});

// UPDATE (PUT)
app.put('/api/alunos/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { nome, email, idade, curso } = req.body;

    const db = lerBancoDados();
    const index = db.alunos.findIndex(a => a.id === id);

    if (index === -1) {
        return res.status(404).json({
            erro: 'Aluno não encontrado'
        });
    }

    if (
        !nome ||
        !email ||
        idade === undefined ||
        idade === null ||
        idade === '' ||
        !Number.isInteger(Number(idade)) ||
        Number(idade) < 1 ||
        !curso
    ) {
        return res.status(400).json({
            error: 'Informe nome, e-mail, idade válida e curso.'
        });
    }

    db.alunos[index] = {
        ...db.alunos[index],
        nome,
        email,
        idade: Number(idade),
        curso
    };

    salvarBancoDados(db);

    res.json(db.alunos[index]);
});

// DELETE
app.delete('/api/alunos/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);

    const db = lerBancoDados();
    const index = db.alunos.findIndex(a => a.id === id);

    if (index === -1) {
        return res.status(404).json({
            erro: 'Aluno não encontrado!'
        });
    }

    db.alunos.splice(index, 1);
    salvarBancoDados(db);

    res.status(204).send();
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
    console.log('Banco de dados local: db.json');
});   