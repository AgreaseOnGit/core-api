const express = require("express");
const cors = require("cors");
const Item = require("./config");
const app = express();
app.use(express.json());
app.use(cors());

app.get("/", async (req, res) => {
  const snapshot = await Item.get();
  const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  res.send(list);
});


app.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await Item.doc(id).get();

    if (!doc.exists) {
      return res.status(404).send({ error: "Document not found" });
    }

    const data = { id: doc.id, ...doc.data() };
    res.send(data);
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

app.post("/create", async (req, res) => {
  const data = req.body;
  await Item.add({ data });
  res.send({ msg: "Item Added" });
});

app.post("/update", async (req, res) => {
  const id = req.body.id;
  delete req.body.id;
  const data = req.body;
  await Item.doc(id).update(data);
  res.send({ msg: "Updated" });
});

app.post("/delete", async (req, res) => {
  const id = req.body.id;
  await Item.doc(id).delete();
  res.send({ msg: "Deleted" });
});
app.listen(8000, () => console.log("Server Started On Port 8000...."));
