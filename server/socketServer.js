const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, '../data');
const EMPLOYEES_FILE = path.join(DATA_DIR, 'employees.json');
const BRANCHES_FILE = path.join(DATA_DIR, 'branches.json');

// Hilfsfunktionen
async function readJsonFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Fehler beim Lesen von ${filePath}:`, error);
        return [];
    }
}

async function writeJsonFile(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Fehler beim Schreiben von ${filePath}:`, error);
        return false;
    }
}

// API Endpoints
app.get('/api/employees', async (req, res) => {
    const employees = await readJsonFile(EMPLOYEES_FILE);
    res.json(employees);
});

app.get('/api/branches', async (req, res) => {
    const branches = await readJsonFile(BRANCHES_FILE);
    res.json(branches);
});

app.post('/api/employees', async (req, res) => {
    const employees = await readJsonFile(EMPLOYEES_FILE);
    const newEmployee = {
        id: String(Date.now()),
        ...req.body,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
    };
    
    employees.push(newEmployee);
    
    if (await writeJsonFile(EMPLOYEES_FILE, employees)) {
        // Echtzeit-Update an alle verbundenen Clients
        io.emit('employeesUpdated', employees);
        res.status(201).json(newEmployee);
    } else {
        res.status(500).json({ error: 'Fehler beim Speichern' });
    }
});

app.post('/api/branches', async (req, res) => {
    const branches = await readJsonFile(BRANCHES_FILE);
    const newBranch = {
        id: String(Date.now()),
        ...req.body,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
    };
    
    branches.push(newBranch);
    
    if (await writeJsonFile(BRANCHES_FILE, branches)) {
        // Echtzeit-Update an alle verbundenen Clients
        io.emit('branchesUpdated', branches);
        res.status(201).json(newBranch);
    } else {
        res.status(500).json({ error: 'Fehler beim Speichern' });
    }
});

// Socket.io Verbindungen
io.on('connection', (socket) => {
    console.log('Client verbunden:', socket.id);
    
    // Initial data senden
    socket.on('requestInitialData', async () => {
        const employees = await readJsonFile(EMPLOYEES_FILE);
        const branches = await readJsonFile(BRANCHES_FILE);
        
        socket.emit('employeesUpdated', employees);
        socket.emit('branchesUpdated', branches);
    });
    
    socket.on('disconnect', () => {
        console.log('Client getrennt:', socket.id);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Socket.io Server läuft auf Port ${PORT}`);
    console.log(`API verfügbar unter: http://localhost:${PORT}/api/`);
});

module.exports = { app, server, io };