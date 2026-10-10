const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Render 디스크가 있으면 /data, 없으면 현재 폴더에 저장
const DATA_DIR = process.env.DATA_DIR || __dirname;
const DATA_FILE = path.join(DATA_DIR, 'data.json');

function loadData() {
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch {
        return { quizzes: [] };
    }
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// 퀴즈 목록
app.get('/api/quizzes', (req, res) => {
    res.json(loadData().quizzes);
});

// 퀴즈 생성
app.post('/api/quizzes', (req, res) => {
    const data = loadData();
    const quiz = {
        id: Date.now(),
        title: req.body.title,
        description: req.body.description || '',
        published: false,
        problems: []
    };
    data.quizzes.push(quiz);
    saveData(data);
    res.json(quiz);
});

// 퀴즈 수정 (공개/비공개 등)
app.put('/api/quizzes/:id', (req, res) => {
    const data = loadData();
    const quiz = data.quizzes.find(q => q.id === parseInt(req.params.id));
    if (!quiz) return res.status(404).json({ error: '없음' });
    Object.assign(quiz, req.body);
    saveData(data);
    res.json(quiz);
});

// 퀴즈 삭제
app.delete('/api/quizzes/:id', (req, res) => {
    const data = loadData();
    data.quizzes = data.quizzes.filter(q => q.id !== parseInt(req.params.id));
    saveData(data);
    res.json({ ok: true });
});

// 문제 추가
app.post('/api/quizzes/:id/problems', (req, res) => {
    const data = loadData();
    const quiz = data.quizzes.find(q => q.id === parseInt(req.params.id));
    if (!quiz) return res.status(404).json({ error: '없음' });
    quiz.problems.push({
        id: Date.now(),
        question: req.body.question,
        image: req.body.image || '',
        answer: req.body.answer
    });
    saveData(data);
    res.json({ ok: true });
});

// 문제 삭제
app.delete('/api/quizzes/:id/problems/:pid', (req, res) => {
    const data = loadData();
    const quiz = data.quizzes.find(q => q.id === parseInt(req.params.id));
    if (quiz) {
        quiz.problems = quiz.problems.filter(p => p.id !== parseInt(req.params.pid));
        saveData(data);
    }
    res.json({ ok: true });
});

app.listen(PORT, () => {
    console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
    console.log(`📁 데이터 저장 위치: ${DATA_FILE}`);
});