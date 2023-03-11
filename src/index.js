const app = require('express')();

const faunadb = require('faunadb');
const client = new faunadb.Client({ secret: 'YOUR_KEY' });

const {
    Paginate,
    Get,
    Select,
    Match,
    Index,
    Create,
    Collection,
    Lambda,
    Var,
    Join
} = faunadb.query;

app.listen(5000, () => console.log('API on http://localhost:5000'));

app.get('/tweet/:id', async (req, res) => {
    const doc = await client.query(
        Get(
            Ref(
                Collection('tweets'),
                req.params.id
            )
        )
            .catch(e => console.log(e))
    );
    res.json(doc);
})

app.post('/tweet', async (req, res) => {

    const data = {
        user: Call(Fn("getUser"), 'usama_dev'),
        text: 'Hello world'
    }

    const doc = await client.query(
        Create(
            Collection('tweets'),
            { data }
        )
            .catch(e => console.log(e))
    );
    res.send(doc);
});

app.get('/tweet', async (req, res) => {
    const docs = await client.query(
        Paginate(
            Match(
                Index('tweets_by_user'),
                Call(Fn('getUser'), 'usama_dev')
            )
        )
            .catch(e => console.log(e))
    );
    res.send(docs);
});

app.post('/relationship', async (req, res) => {
    const data = {
        follower: Call(Fn('getUser'), 'bob'),
        followee: Call(Fn('getUser'), 'alice')
    }

    const doc = await client.query(
        Create(
            Collection('relationships'),
            { data }
        )
            .catch(e => console.log(e))
    );
    res.send(doc);
});

app.get('/feed', async (req, res) => {
    const docs = await client.query(
        Paginate(
            Join(
                Match(
                    Index('followees_by_follower'),
                    Call(Fn('getUser'), 'bob')
                ),
                Index('tweets_by_user')
            )
        )
            .catch(e => console.log(e))
    );
    res.send(docs);
});
