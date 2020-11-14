const { Schema } = require('mongoose');

const CubeSchema = new Schema({
  cubeId: String,
  name: String,
  userId: String,
  arrayOfMoves: [],
  globalPosition: Number,
  solved: Boolean,
});

function createCube(mongooseConnection) {
  return mongooseConnection.model('Cube', CubeSchema);
}

module.exports = createCube;
