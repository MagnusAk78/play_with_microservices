const cubeProjection = {
  $init() {
    return {
      cubeId: null,
      startCube: null,
      arrayOfMoves: [],
      isSolved: false,
      isCreated: false,
    };
  },
  Created(cube, cubeCreated) {
    cube.cubeId = cubeCreated.data.cubeId;
    cube.arrayOfMoves.push({
      cube: cubeCreated.data.cube, 
      traceId: cubeCreated.metadata.traceId,
      moves: '',
      solution: cubeCreated.data.solution
    });
    cube.isCreated = true;

    return cube;
  },
  Moved(cube, cubeMoved) {
    cube.arrayOfMoves.push({
      cube: cubeMoved.data.cube,
      traceId: cubeMoved.metadata.traceId,
      moves: cubeMoved.data.moves, 
      solution: cubeMoved.data.solution
    });
    return cube;
  },
  Solved(cube, cubeSolved) {
    cube.isSolved = true;

    return cube;
  },
};

module.exports = cubeProjection;
