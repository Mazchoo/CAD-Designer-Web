// Note: The code in this file does not use the 'dst' output parameter of functions in the
// 'wgpu-matrix' library, so produces many temporary vectors and matrices.
// This is intentional, as this sample prefers readability over performance.
import { Mat4, Vec3, Vec4, mat4, vec3 } from 'wgpu-matrix';
import Input from './input';

// Common interface for camera implementations
export default interface Camera {
  // update updates the camera using the user-input and returns the view matrix.
  update(delta_time: number, input: Input): Mat4;

  // The camera matrix.
  // This is the inverse of the view matrix.
  matrix: Mat4;
  // Alias to column vector 0 of the camera matrix.
  right: Vec4;
  // Alias to column vector 1 of the camera matrix.
  up: Vec4;
  // Alias to column vector 2 of the camera matrix.
  back: Vec4;
  // Alias to column vector 3 of the camera matrix.
  position: Vec4;
}

// The common functionality between camera implementations
class CameraBase {
  // The camera matrix
  private matrix_ = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

  // The calculated view matrix
  private readonly view_ = mat4.create();

  // Aliases to column vectors of the matrix
  private right_ = new Float32Array(this.matrix_.buffer, 4 * 0, 4);
  private up_ = new Float32Array(this.matrix_.buffer, 4 * 4, 4);
  private back_ = new Float32Array(this.matrix_.buffer, 4 * 8, 4);
  private position_ = new Float32Array(this.matrix_.buffer, 4 * 12, 4);

  // Returns the camera matrix
  get matrix() {
    return this.matrix_;
  }
  // Assigns `mat` to the camera matrix
  set matrix(mat: Mat4) {
    mat4.copy(mat, this.matrix_);
  }

  // Returns the camera view matrix
  get view() {
    return this.view_;
  }
  // Assigns `mat` to the camera view
  set view(mat: Mat4) {
    mat4.copy(mat, this.view_);
  }

  // Returns column vector 0 of the camera matrix
  get right() {
    return this.right_;
  }
  // Assigns `vec` to the first 3 elements of column vector 0 of the camera matrix
  set right(vec: Vec3) {
    vec3.copy(vec, this.right_);
  }

  // Returns column vector 1 of the camera matrix
  get up() {
    return this.up_;
  }
  // Assigns `vec` to the first 3 elements of column vector 1 of the camera matrix
  set up(vec: Vec3) {
    vec3.copy(vec, this.up_);
  }

  // Returns column vector 2 of the camera matrix
  get back() {
    return this.back_;
  }
  // Assigns `vec` to the first 3 elements of column vector 2 of the camera matrix
  set back(vec: Vec3) {
    vec3.copy(vec, this.back_);
  }

  // Returns column vector 3 of the camera matrix
  get position() {
    return this.position_;
  }
  // Assigns `vec` to the first 3 elements of column vector 3 of the camera matrix
  set position(vec: Vec3) {
    vec3.copy(vec, this.position_);
  }
}

// WASDCamera is a camera implementation that behaves similar to first-person-shooter PC games.
export class WASDCamera extends CameraBase implements Camera {

  // The movement veloicty
  private readonly velocity_ = vec3.create();

  // Speed multiplier for camera movement
  movementSpeed = 10;

  // Speed multiplier for camera rotation
  rotationSpeed = 1;

  // Speed multiplier for scrolling
  zoomSpeed = 50;

  // Movement velocity drag coeffient [0 .. 1]
  // 0: Continues forever
  // 1: Instantly stops moving
  frictionCoefficient = 0.99;

  // Returns velocity vector
  get velocity() {
    return this.velocity_;
  }
  // Assigns `vec` to the velocity vector
  set velocity(vec: Vec3) {
    vec3.copy(vec, this.velocity_);
  }

  // Construtor
  constructor(options?: {
    // The initial position of the camera
    position?: Vec3;
    // The initial target of the camera
    target?: Vec3;
  }) {
    super();
    if (options && (options.position || options.target)) {
      const position = options.position ?? vec3.create(0, 0, -5);
      const target = options.target ?? vec3.create(0, 0, 0);
      const back = vec3.normalize(vec3.sub(position, target));
      this.position = position;
    }
  }

  // Returns the camera matrix
  get matrix() {
    return super.matrix;
  }

  // Assigns `mat` to the camera matrix, and recalcuates the camera angles
  set matrix(mat: Mat4) {
    super.matrix = mat;
  }

  update(deltaTime: number, input: Input): Mat4 {
    const sign = (positive: boolean, negative: boolean) => (positive ? 1 : 0) - (negative ? 1 : 0);

    // Save the current position, as we're about to rebuild the camera matrix.
    const position = vec3.copy(this.position);

    // Calculate the new target velocity
    const digital = input.digital;

    const targetZoom = vec3.create()
    if (input.analog.zoom !== 0) {
      targetZoom[2] = input.analog.zoom * this.zoomSpeed;
    }

    const deltaRight = sign(digital.right, digital.left);
    const deltaUp = sign(digital.up, digital.down);
    const targetVelocity = vec3.create();
    const deltaBack = input.analog.zoom * this.zoomSpeed;
    vec3.addScaled(targetVelocity, this.right, deltaRight, targetVelocity);
    vec3.addScaled(targetVelocity, this.up, deltaUp, targetVelocity);
    vec3.addScaled(targetVelocity, this.back, deltaBack, targetVelocity);
    vec3.addScaled(targetVelocity, this.right, input.analog.x, targetVelocity);
    vec3.addScaled(targetVelocity, this.up, -input.analog.y, targetVelocity);
    vec3.normalize(targetVelocity, targetVelocity);
    const targetSpeed = (input.analog.zoom !== 0) ? this.zoomSpeed: this.movementSpeed;
    vec3.mulScalar(targetVelocity, targetSpeed, targetVelocity);

    // Mix new target velocity
    this.velocity = lerp(targetVelocity, this.velocity, Math.pow(1 - this.frictionCoefficient, deltaTime));

    // Integrate velocity to calculate new position
    this.position = vec3.addScaled(position, this.velocity, deltaTime);;

    // Invert the camera matrix to build the view matrix
    this.view = mat4.invert(this.matrix);
    return this.view;
  }
}

// Returns the linear interpolation between 'a' and 'b' using 's'
function lerp(a: Vec3, b: Vec3, s: number): Vec3 {
  return vec3.addScaled(a, vec3.sub(b, a), s);
}
