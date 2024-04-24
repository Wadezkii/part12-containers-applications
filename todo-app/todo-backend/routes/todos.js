const express = require('express');
const { Todo } = require('../mongo')
const router = express.Router();
const redis = require('redis');

/* GET todos listing. */
router.get('/', async (_, res) => {
  const todos = await Todo.find({})
  res.send(todos);
});

/* POST todo to listing. */
router.post('/', async (req, res) => {
  try {
    const todo = await Todo.create({
      text: req.body.text,
      done: false
    });

    // Redis counter increment
    const currentCount = await redis.getAsync('added_todos') || 0;
    await redis.setAsync('added_todos', parseInt(currentCount) + 1);

    res.send(todo);
  } catch (error) {
    res.status(500).send({ message: 'Error adding todo', error });
  }
});

router.get('/statistics', async (_, res) => {
  try {
    const addedTodos = await redis.getAsync('added_todos') || 0;
    res.send({ added_todos: parseInt(addedTodos) });
  } catch (error) {
    res.status(500).send({ message: 'Error retrieving statistics', error });
  }
});

const singleRouter = express.Router();

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params
  req.todo = await Todo.findById(id)
  if (!req.todo) return res.sendStatus(404)

  next()
}

/* DELETE todo. */
singleRouter.delete('/', async (req, res) => {
  await req.todo.delete()  
  res.sendStatus(200);
});

/* GET todo. */
singleRouter.get('/', async (req, res) => {
  res.send(req.todo);
});

/* PUT todo. */
singleRouter.put('/', async (req, res) => {
  const updates = req.body;
  const updatedTodo = await Todo.findByIdAndUpdate(req.todo._id, updates, { new: true });
  if (!updatedTodo) {
      return res.sendStatus(404);
  }
  res.send(updatedTodo);
});

router.use('/:id', findByIdMiddleware, singleRouter)


module.exports = router;
