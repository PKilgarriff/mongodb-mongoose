## Setting up MongoDB

Following instructions [here](https://www.mongodb.com/developer/how-to/getting-started-with-mongodb-and-mongoose/) and [here](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/)

- local installation of mongoDB (Community Edition)
- could change to MongoDB Atlas Edition -> run in the cloud and has a free tier
  - this might require more initial setup but be useful for working in a distributed team
  - would require proper mocking on local instances

Assuming that [homebrew](https://brew.sh/) is already installed:

```
brew tap mongodb/brew
brew install mongodb-community@5.0
brew services start mongodb-community@5.0
brew services list
```

The last command is checking that mongodb service has been started as a MacOS service, you should see somthing similar in your output

```
Name              Status  User      File
mongodb-community started your-user ~/Library/LaunchAgents/homebrew.mxcl.mongodb-community.plist
```

The connection to the database happens in index.js

CRUD operations can be done from `mongosh` (Short for Mongo Shell - so the mongoDB CLI)

- [Create](https://www.mongodb.com/docs/manual/tutorial/insert-documents/)
- [Read/Query](https://www.mongodb.com/docs/mongodb-shell/crud/read/#std-label-mongosh-read)
- [Update](https://www.mongodb.com/docs/manual/tutorial/update-documents/)
- [Delete/Remove](https://www.mongodb.com/docs/manual/tutorial/remove-documents/)

CRUD Operations can also be done in the app (returning to [this walkthrough](https://www.mongodb.com/developer/how-to/getting-started-with-mongodb-and-mongoose/#creating-a-schema-and-model))

Instead of connecting to the suggested cloud mongodb, all the following commands have a reference to the localhost mongodb

- easiest way to get that is to run `mongosh` with no arguments
- the local mongodb url will be displayed on terminal as part of the output

## Return to Mongoose

- Mongoose requires a schema to be created, which is demonstrated in [blog.js](./model/blog.js)
  - This seems to be a way of forcing some predictable structure on the noSQL mongoDB
- Once this is done, the schema can be referred to in order to instantiate and save (or just to directly create) objects that then map to database entries
  - save and create are asynchronous functions => need _await_
  - everything so far has been done as ESModules (not CommonJS)
  - the package.json also requires "type": "module" (mentioned in the setup walkthrough)
    - **this means that await is available as a top-level keyword**

> Note: `"dev": "nodemon index.js"` is one of the entries added under scripts in the package.json if following the walkthrough
>
> - very worthwhile as it runs index.js continuously and monitors changes

- Once a local model of the database object has been created, all that is needed to update it is to update the property locally, then call `await objectName.save()` to save the updated version back to the databse:

```js
// Create a Blog post
// both locally and on the database because we used create()
const article = await Blog.create({
  title: "Awesome Post!",
});

// Update the local object that represents the database object
article.title = "I lied, it was a rubbish post";

// Save the updates back to the server (async)
await article.save();
```

The return value from doing either of the above operations is a JSON object with a couple of keys that are generated by mongoDB

```json
{
  title: 'Even More Awesome Post',
  slug: 'awesome-post',
  published: true,
  content: 'This is the best post ever',
  tags: [ 'featured', 'announcement' ],
  _id: new ObjectId("6252e40673f1391fb19945ea"),
  comments: [],
  __v: 0
}
```

The one to note is `_id` as this allows us to search for this object on the database by this unique identifier

```js
const article = await Blog.create({
  title: "Awesome Post!",
});
console.log("Created Article:", article);

let articleId = article._id;

const returnArticle = await Blog.findById(articleId).exec();
console.log("Queried from DB by ID:", returnArticle);
```

`findById` is Mongoose helper function that returns a Query Object - which they very explicitly say is _not a promise_, but may or may not behave a lot like a promise.
There is something about using `.exec()` afterwards that one of these walkthroughs recommends.
There are also other helper functions detailed [here](https://mongoosejs.com/docs/queries.html) including several that find and then do another CRUD operation so will be **time-saving**

## Validation

[Relevant Section of Walkthrough](https://www.mongodb.com/developer/how-to/getting-started-with-mongodb-and-mongoose/#validation)

Validation is set up in the schema, and only applies to create and save operations (which makes sense).

Instead of passing a single value to a key (which represent the 'columns' of data), you pass an object with further info.

So instead of `title: String` you would pass:

```js
// Extract from Blog schema in model/blog.js
title: {
  value: String,
  required: true,
}
```

'Value' is a hidden key that is implied when only passing one piece of data to a Mongoose schema, so you have to write it out in full when passing other key:value pairs.
The above object now means that any Blog entry that is created or saved without a title is rejected.
You can also do case conversion (e.g. `lowercase: true`), stop a value from being changed once set (`immutable: true`) and probably other things like default values as well.

## Next Steps

[This](https://www.mongodb.com/developer/how-to/getting-started-with-mongodb-and-mongoose/#other-useful-methods) is the point of the walkthrough I have reached.

- it mentions other useful methods that mongoose introduces
  - including a predicate exists()
  - chainable where() for complex queries
  - populate() to join tables (even though the noSQL design does not necessarily require multiple tables like relational DBs)

there is a way to directly define a method **in the schema** which then gets passed to the database.

- See the example of the cat being able to 'speak' in the official mongoose [quick start](https://mongoosejs.com/docs/)
- there are caveats to this:
  - methods must be defined with the legacy syntax instead of arrow syntax:
  ```
  function functionName(arg) {
    // return whatever
    }
  ```
  - This is to do with what `this` refers to in an arrow function -> similar issue in React
- you can also define your own find methods (maybe like `findAllPostsByUser`?)

- if for some reason you needed to update the schema after it has been in use, there is a Schema.add() method

## Things to Understand Properly

- queryHelpers
  - way of defining a set chain of queries to DRY up database queries
- virtuals
  - 'fake' properties of a database object that do soemthing useful to real object before it is provided
    - example: a virtual `fullName` that capitalises and then joins the actual `firstName` and `lastName` properties without changing the originals or taking up DB space
- aliases
  - if you have a property that is ridiculously nested like `post.user.demographics.name` you can alias it in your schema to something more readable e.g. `authorName`
  - you can also do this if the property on the database object is really short and uninformative
    - `n` to `userName` for example

## Useful Links

- [Official Mongoose Docs](https://mongoosejs.com/docs/)
- [Mongoose Queries](https://mongoosejs.com/docs/queries.html)
