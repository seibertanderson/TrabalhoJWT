//var http = require('http');
const express = require('express')
const bodyParser = require('body-parser')
const expressJWT = require('express-jwt')
const jwt = require('jsonwebtoken')
const app = express()

app.use(bodyParser)
app.use(expressJWT({ secret: 'string de secret' })) // Utilizamos nosso middleware JWT

//app.use(bodyParser.urlencoded({ extended: true }));
//app.use(expressJWT({ secret: 'string de secret' }).unless({ path: ['/login'] }))
//app.use(bodyParser.json());
//app.use(cookieParser());

app.get('/', (req, res, next) => {
    res.json({ message: "OK!" });
});


app.post('/login', (req, res) => {
    if (!req.body.usuario) {
        res.status(400).send('Username required')
        return
    } else if (!req.body.senha) {
        res.status(400).send('Password Required')
        return
    }

    if (req.body.usuario === 'anderson' && req.body.senha === '123') {
        //auth ok
        const id = 1; //esse id viria do banco de dados
        var token = jwt.sign({ id }, process.env.SECRET, {
            expiresIn: 300 // expires in 5min
        });
        let meuToken = jwt.sign({ usuario: req.body.usuario }, 'string de secret')
        return res.json({ auth: true, token: meuToken });
    }

    res.status(500).json({ message: 'Login inválido!' });
})

app.get('/clientes', verifyJWT, (req, res, next) => {
    console.log("Retornou todos clientes!");
    res.json([{ id: 1, nome: 'luiz' }]);
})

/* AUTENTICAÇÃO */
app.post('/login2', (req, res, next) => {
    //esse teste abaixo deve ser feito no seu banco de dados
    if (req.body.usuario === 'anderson' && req.body.senha === '123') {
        //auth ok
        const id = 1; //esse id viria do banco de dados
        var token = jwt.sign({ id }, process.env.SECRET, {
            expiresIn: 300 // expires in 5min
        });
        return res.json({ auth: true, token: token });
    }

    res.status(500).json({ message: 'Login inválido!' });
});

app.post('/logout', function(req, res) {
    res.json({ auth: false, token: null });
});

/* FUNÇÃO QUE ATUA COMO MIDDLEWARE VERIFICANDO O TOKEN NO HEADER DAS REQUISIÇÕES */
function verifyJWT(req, res, next) {
    debugger
    //var token = req.headers['x-access-token'];
    //var token = req.headers['Authorization'];
    var token = req.headers['Authorization: Bearer '];

    if (!token) return res.status(401).json({ auth: false, message: 'Nenhum token.' });

    jwt.verify(token, process.env.SECRET, function(err, decoded) {
        if (err) return res.status(500).json({ auth: false, message: 'Falha ao autenticar token.' });

        // se tudo estiver ok, salva no request para uso posterior
        req.userId = decoded.id;
        next();
    });
}

var server = http.createServer(app);
server.listen(3000);
console.log("Servidor escutando na porta 3000...")