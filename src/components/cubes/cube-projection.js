const cubeProjection = {
  $init() {
    return {
      cubeId: null,
      startCube: null,
      cube: null,
      movesArray: [],
      isSolved: false,
      isCreated: false,
    };
  },
  Created(cube, cubeCreated) {
    cube.cubeId = cubeCreated.data.cubeId;
    cube.startCube = cubeCreated.data.cube;
    cube.cube = cubeCreated.data.cube;
    cube.isCreated = true;

    return cube;
  },
  Moved(cube, cubeMoved) {
    cube.cube = cubeMoved.data.cube;
    cube.movesArray.push(cubeMoved.moves);

    return cube;
  },
  Solved(cube, cubeSolved) {
    cube.isSolved = true;

    return cube;
  },
};

module.exports = cubeProjection;
