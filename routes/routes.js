const express = require('express');
const router = express.Router();
const route = require('.');

/* GET title */
router.get('/title', route.title.searchTitle);
router.get('/category', route.category.searchCategory);
router.get('/author', route.author.searchAuthor);

module.exports = router;
