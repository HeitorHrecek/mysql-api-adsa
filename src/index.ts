import express, {Request, Response} from "express";
import mysql from "mysql2/promise";

const app = express();


app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

const connection = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "mudar123",
    database: "unicesumar"
});


app.use(express.json());

app.use(express.urlencoded({ extended: true }));




app.get('/', (req, res) => {
    res.render('home.ejs'); 
})




app.get('/categories', async function (req: Request, res: Response) {
    const [rows] = await connection.query("SELECT * FROM categories");
    return res.render('categories/indexCat', {
        categories: rows
    });
});

app.get("/categories/form", async function (req: Request, res: Response) {
    return res.render("categories/formCat");
});

app.post("/categories/save", async function(req: Request, res: Response) {
    const body = req.body;
    const insertQuery = "INSERT INTO categories (name) VALUES (?)";
    await connection.query(insertQuery, [body.name]);

    res.redirect("/categories");
});

app.post("/categories/delete/:id", async function (req: Request, res: Response) {
    const id = req.params.id;
    const sqlDelete = "DELETE FROM categories WHERE id = ?";
    await connection.query(sqlDelete, [id]);

    res.redirect("/categories");
});





app.get('/users/add', (req, res) => {
    res.render('users/formUser'); 
});



app.get('/login', (req, res) => {
    res.render('login'); 
});





app.get('/users', async (req, res) => {
    try {
        const [users] = await connection.query('SELECT * FROM users');
        res.render('users/indexUser', { users });
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
});


app.get('/users/:id/edit', async (req, res) => {
    const userId = req.params.id;

    try {
        
        const [rows]: any = await connection.query('SELECT id, name, email FROM users WHERE id = ?', [userId]);

        
        if (rows.length > 0) {
            
            res.render('users/editUser', { user: rows[0] });
        } else {
            
            res.status(404).send('Usuário não encontrado');
        }
    } catch (error) {
        
        console.error('Erro ao buscar o usuário:', error);
        res.status(500).send('Erro ao buscar o usuário');
    }
});


app.post('/users/:id/edit', async (req, res) => {
    const userId = req.params.id;
    const { name, email } = req.body;

    try {
        await connection.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, userId]);
        res.redirect('/users'); 
    } catch (error) {
        console.error('Erro ao editar o usuário:', error);
        res.status(500).send('Erro ao editar o usuário');
    }
});




app.post('/users', async (req, res) => {
    const { name, email, password, confirm_password, role, active } = req.body;

    if (password !== confirm_password) {
        return res.redirect('/users/add'); 
    }

    try {
        
        await connection.query('INSERT INTO users (name, email, password, role, active) VALUES (?, ?, ?, ?, ?)', 
        [name, email, password, role, active ? 1 : 0]);

        res.redirect('/users');
    } catch (error) {
        console.error(error);
        res.redirect('/users/add');
    }
});


app.post('/users/:id/delete', async (req, res) => {
    const userId = req.params.id;

    try {
        
        await connection.query('DELETE FROM users WHERE id = ?', [userId]);
        res.redirect('/users'); 
    } catch (error) {
        console.error('Erro ao deletar o usuário:', error);
        res.redirect('/users'); 
    }
});



app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        
        const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);

        
        const user = rows[0]; 

        
        if (user && user.password === password) {
            res.redirect('/'); 
        } else {
            res.redirect('/login'); 
        }
    } catch (error) {
        console.error(error);
        res.redirect('/login');
    }
});




app.listen('3000', () => console.log("Server is listening on port 3000"));