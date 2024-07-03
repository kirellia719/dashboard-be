const Note = require("../models/Note");

const saveNote = async (req, res) => {
   const user = req.user;
   try {
      const { content } = req.body;
      const note = await Note.findOne({ ownerId: user._id });
      let newNote;
      if (note) {
         note.content = content;
         newNote = await note.save();
      } else {
         newNote = await Note.create({ ownerId: user._id, content });
      }
      res.json({
         status: 200,
         data: newNote,
      });
   } catch (error) {
      console.log(error);
   }
};

const getNote = async (req, res) => {
   const user = req.user;
   try {
      const note = await Note.findOne({ ownerId: user._id });
      res.json({
         status: 200,
         data: note,
      });
   } catch (error) {
      console.log(error);
   }
};

module.exports = {
   getNote,
   saveNote,
};
