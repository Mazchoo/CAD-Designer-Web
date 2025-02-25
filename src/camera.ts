// Note: The code in this file does not use the 'dst' output parameter of functions in the
// 'wgpu-matrix' library, so produces many temporary vectors and matrices.
// This is intentional, as this sample prefers readability over performance.
import { Mat4, Vec3, mat4, vec3 } from 'wgpu-matrix';
import Input from './input';

// WASDCamera is a camera implementation that behaves similar to first-person-shooter PC games.
export class WASDCamera {

  matrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

  // The calculated view matrix
  view = mat4.create();

  // Aliases to column vectors of the matrix
  right = new Float32Array(this.matrix.buffer, 4 * 0, 4);
  up = new Float32Array(this.matrix.buffer, 4 * 4, 4);
  back = new Float32Array(this.matrix.buffer, 4 * 8, 4);
  private position_ = new Float32Array(this.matrix.buffer, 4 * 12, 4);

  // Returns column vector 3 of the camera matrix
  get position() {
    return this.position_;
  }
  // Assigns `vec` to the first 3 elements of column vector 3 of the camera matrix
  set position(vec: Vec3) {
    vec3.copy(vec, this.position_);
  }

  // The movement veloicty
  velocity = vec3.create(0, 0, 0);

  // Speed multiplier for camera movement
  movementSpeed = 2;

  // Speed multiplier for scrolling
  zoomSpeed = 800;

  // Controls zoom
  minDistance = -1.0;
  maxDistance = -10000.0;

  // Controls stopping panning on zoom if this ratio above min distance
  minPanRatio = 4;

  // Movement velocity drag coeffient [0 .. 1]
  // 0: Continues forever
  // 1: Instantly stops moving
  frictionCoefficient = 0.99;

  // Construtor
  constructor(position: Vec3) {
    this.position = position;
  }

  update(deltaTime: number, input: Input): Mat4 {
    const sign = (positive: boolean, negative: boolean) => (positive ? 1 : 0) - (negative ? 1 : 0);

    // Save the current position, as we're about to rebuild the camera matrix.

    // Calculate the new target velocity
    const digital = input.digital;

    const deltaRight = sign(digital.right, digital.left);
    const deltaUp = sign(digital.up, digital.down);
    const targetVelocity = vec3.create();
    const deltaBack = input.analog.zoom;
    vec3.addScaled(targetVelocity, this.right, deltaRight, targetVelocity);
    vec3.addScaled(targetVelocity, this.up, deltaUp, targetVelocity);
    vec3.addScaled(targetVelocity, this.back, deltaBack, targetVelocity);
    vec3.addScaled(targetVelocity, this.right, input.analog.x, targetVelocity);
    vec3.addScaled(targetVelocity, this.up, -input.analog.y, targetVelocity);

    // Add specific behaviour when zooming
    if (
      input.analog.zoom !== 0 &&
      this.position[2] < this.minDistance * this.minPanRatio &&
      this.position[2] > this.maxDistance
    ) {
      const multiplier = -Math.sign(input.analog.zoom);
      vec3.addScaled(targetVelocity, this.right, multiplier * input.analog.mouseX, targetVelocity);
      vec3.addScaled(targetVelocity, this.up, multiplier * -input.analog.mouseY, targetVelocity);
    }

    vec3.normalize(targetVelocity, targetVelocity);
    // If zooming, use constant else use zoom to determine speed
    const targetSpeed = input.analog.zoom !== 0 ? this.zoomSpeed : this.movementSpeed * -this.position[2];
    vec3.mulScalar(targetVelocity, targetSpeed, targetVelocity);

    // Mix new target velocity
    this.velocity = lerp(targetVelocity, this.velocity, Math.pow(1 - this.frictionCoefficient, deltaTime));

    // Integrate velocity to calculate new position
    this.position = vec3.addScaled(this.position, this.velocity, -deltaTime);
    this.position[2] = Math.min(this.position[2], this.minDistance);

    return this.matrix;
  }
}

// Returns the linear interpolation between 'a' and 'b' using 's'
function lerp(a: Vec3, b: Vec3, s: number): Vec3 {
  return vec3.addScaled(a, vec3.sub(b, a), s);
}
