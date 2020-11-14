# Identity Service

Manages rubik's cubes.

## Stream Categories

|         |                    |
| ------- | ------------------ |
| entity  | `cubes`            |
| command | `cubes:command`    |

## Commands

### Create

Instruction to create a cube.  When successful, a `Created` event will be written.

Data:

* `cubeId`   - The id for the cube
* `userId`   - The id for the logged in user
* `name`     - The name for the cube

### DoMoves

Instruction to do one or more moves on a cube. When successful, a `Moved` event will be written
perhaps also followed by a `Solved` event.

Data:

* `cubeId`   - The id for the cube
* `moves`    - A string with a series of moves

## Events

### Created

Signals that a new rubiks cube have been created.

Data:

* `cubeId`   - The id for the cube
* `name`     - The name for the cube
* `userId`   - User id (since the name must be unique per user)
* `cube`     - The initial state of the cube
* `solution` - The solution (what moves would solve the initial state)

### Moved

Signals that a moves have been made on a cube.

Data:

* `cubeId`   - The id for the cube
* `moves`    - The moves that have been issued
* `cube`     - The new state of the cube
* `solution` - The solution (what moves would solve the new state)

### Solved

Signals that a cube have been solved.

Data:

* `cubeId`   - The id for the cube
