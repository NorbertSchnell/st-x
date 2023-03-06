const Engine = Matter.Engine,
  Events = Matter.Events,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Body = Matter.Body,
  Composite = Matter.Composite,
  Composites = Matter.Composites,
  Constraint = Matter.Constraint,
  Bodies = Matter.Bodies,
  Vector = Matter.Vector;

const patternDisplay = document.getElementById('pattern-display');

const width = 800;
const height = 800;

const headRadius = 20;
const limbLength = 100;
const limbWidth = 20;
const crossHorizontalLength = 400;
const crossVerticalLength = 700;
const crossWidth = 30;
const limbOverlap = 20;
const torsoLength = 150;
const neckLength = 10;
const upperFixPointDist = 1.6 * limbLength;
const lowerFixPointDist = 3.2 * limbLength;

const frictionAir = 0.3;
const frictionStatic = 0.3;
const stiffnessHigh = 0.5;
const stiffnessMedium = 0.1;
const stiffnessLow = 0.000001;

// left arm, right arm, left leg, right leg

const center = { x: 0.5 * width, y: 0.333 * height };
const leftPoint = { x: center.x - upperFixPointDist, y: center.y };
const rightPoint = { x: center.x + upperFixPointDist, y: center.y };
const upperPoint = { x: center.x, y: center.y - upperFixPointDist };
const lowerPoint = { x: center.x, y: center.y + lowerFixPointDist };
const points = [center, leftPoint, rightPoint, upperPoint, lowerPoint];

const upperJoint = { x: -0.5 * limbLength + 0.5 * limbOverlap, y: 0 };
const lowerJoint = { x: 0.5 * limbLength - 0.5 * limbOverlap, y: 0 };
const torsoHeadJoint = { x: -headRadius - 0.5 * torsoLength - 0.5 * neckLength, y: 0 };
const torsoArmJoint = { x: -0.5 * torsoLength + 0.5 * limbOverlap + 0.5 * neckLength, y: 0 };
const torsoLegJoint = { x: 0.5 * torsoLength - 0.5 * limbOverlap + 0.5 * neckLength, y: 0 };

const crossRenderOptions = {
  fillStyle: '#333',
  lineWidth: 0
};

const limbRenderOptions = {
  fillStyle: 'rgba(127, 127, 127, 0.75)',
  strokeStyle: 'rgba(127, 127, 127, 1)',
  lineWidth: 1
};

const jointRenderOptions = {
  fillStyle: 'transparent',
  lineWidth: 0
};

const fixationRenderOptions = {
  type: 'line',
  fillStyle: 'transparent',
  lineWidth: 1,
  visible: false
};

const cross = Composite.create({ label: 'Cross' });
const stickman = Composite.create({ label: 'Stickman' });

// create engine
const engine = Engine.create(),
  world = engine.world;

// create renderer
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: width,
    height: height,
    wireframes: false
  }
});

Render.run(render);

// create runner
const runner = Runner.create();
Runner.run(runner, engine);

// add bodies
const group = Body.nextGroup(true);

const crossHorizontalBar = Bodies.rectangle(0, 0, crossHorizontalLength, crossWidth, {
  collisionFilter: { group: group },
  frictionAir: frictionAir,
  chamfer: 5,
  render: crossRenderOptions,
});

Composite.add(cross, crossHorizontalBar);

Composite.add(cross, Constraint.create({
  pointA: leftPoint,
  bodyB: crossHorizontalBar,
  pointB: { x: -0.5 * crossHorizontalLength, y: 0 },
  stiffness: stiffnessMedium,
  length: 0,
  render: fixationRenderOptions,
}));

Composite.add(cross, Constraint.create({
  pointA: rightPoint,
  bodyB: crossHorizontalBar,
  pointB: { x: 0.5 * crossHorizontalLength, y: 0 },
  stiffness: stiffnessMedium,
  length: 0,
  render: fixationRenderOptions,
}));

const crossVerticalBar = Bodies.rectangle(0, 0, crossVerticalLength, crossWidth, {
  collisionFilter: { group: group },
  frictionAir: frictionAir,
  chamfer: 5,
  render: crossRenderOptions,
});

Composite.add(cross, crossVerticalBar);

Composite.add(cross, Constraint.create({
  pointA: upperPoint,
  bodyB: crossVerticalBar,
  pointB: { x: -0.5 * crossVerticalLength - 100, y: 0 },
  stiffness: stiffnessHigh,
  length: 0,
  render: fixationRenderOptions,
}));

Composite.add(cross, Constraint.create({
  pointA: lowerPoint,
  bodyB: crossVerticalBar,
  pointB: { x: 0.5 * crossVerticalLength - 100, y: 0 },
  stiffness: stiffnessHigh,
  length: 0,
  render: fixationRenderOptions,
}));

for (let i = 0; i < 8; i++) {
  const limb = Bodies.rectangle(0, 0, limbLength, limbWidth, {
    collisionFilter: { group: group },
    frictionAir: frictionAir,
    chamfer: 5,
    render: limbRenderOptions,
  });

  Composite.add(stickman, limb);
}

const upperLeftArm = stickman.bodies[0];
const lowerLeftArm = stickman.bodies[1];
const upperRightArm = stickman.bodies[2];
const lowerRightArm = stickman.bodies[3];
const upperLeftLeg = stickman.bodies[4];
const lowerLeftLeg = stickman.bodies[5];
const upperRightLeg = stickman.bodies[6];
const lowerRightLeg = stickman.bodies[7];

// create head
const head = Bodies.circle(0, 0, headRadius, {
  collisionFilter: { group: group },
  frictionAir: frictionAir,
  chamfer: 5,
  render: limbRenderOptions,
});

Composite.add(stickman, head);

// create torso
const torso = Bodies.rectangle(0, 0, torsoLength + neckLength, limbWidth, {
  collisionFilter: { group: group },
  frictionAir: frictionAir,
  frictionStatic: frictionStatic,
  chamfer: 5,
  render: limbRenderOptions,
});

Composite.add(stickman, torso);

engine.gravity.scale = 0.002;

// assemble left arm
Composite.add(stickman, Constraint.create({
  bodyA: upperLeftArm,
  bodyB: lowerLeftArm,
  pointA: { ...lowerJoint },
  pointB: { ...upperJoint },
  stiffness: stiffnessHigh,
  length: 0,
  render: jointRenderOptions,
}));

// assemble right arm
Composite.add(stickman, Constraint.create({
  bodyA: upperRightArm,
  bodyB: lowerRightArm,
  pointA: { ...lowerJoint },
  pointB: { ...upperJoint },
  stiffness: stiffnessHigh,
  length: 0,
  render: jointRenderOptions,
}));

// assemble left leg
Composite.add(stickman, Constraint.create({
  bodyA: upperLeftLeg,
  bodyB: lowerLeftLeg,
  pointA: { ...lowerJoint },
  pointB: { ...upperJoint },
  stiffness: stiffnessHigh,
  length: 0,
  render: jointRenderOptions,
}));

// assemble right leg
Composite.add(stickman, Constraint.create({
  bodyA: upperRightLeg,
  bodyB: lowerRightLeg,
  pointA: { ...lowerJoint },
  pointB: { ...upperJoint },
  stiffness: stiffnessHigh,
  length: 0,
  render: jointRenderOptions,
}));

// fix head at torso
Composite.add(stickman, Constraint.create({
  bodyA: torso,
  bodyB: head,
  pointA: { ...torsoHeadJoint },
  stiffness: stiffnessHigh,
  length: 0,
  render: jointRenderOptions,
}));

// fix left arm at torso
Composite.add(stickman, Constraint.create({
  bodyA: torso,
  bodyB: upperLeftArm,
  pointA: { ...torsoArmJoint },
  pointB: { ...upperJoint },
  stiffness: stiffnessHigh,
  length: 0,
  render: jointRenderOptions,
}));

// fix right arm at torso
Composite.add(stickman, Constraint.create({
  bodyA: torso,
  bodyB: upperRightArm,
  pointA: { ...torsoArmJoint },
  pointB: { ...upperJoint },
  stiffness: stiffnessHigh,
  length: 0,
  render: jointRenderOptions,
}));

// fix left leg at torso
Composite.add(stickman, Constraint.create({
  bodyA: torso,
  bodyB: upperLeftLeg,
  pointA: { ...torsoLegJoint },
  pointB: { ...upperJoint },
  stiffness: stiffnessHigh,
  length: 0,
  render: jointRenderOptions,
}));

// fix right leg at torso
Composite.add(stickman, Constraint.create({
  bodyA: torso,
  bodyB: upperRightLeg,
  pointA: { ...torsoLegJoint },
  pointB: { ...upperJoint },
  stiffness: stiffnessHigh,
  length: 0,
  render: jointRenderOptions,
}));

// fix left arm
const leftArmPoint = { ...leftPoint };
const leftArmConstraint = Constraint.create({
  pointA: leftArmPoint,
  bodyB: lowerLeftArm,
  pointB: { ...lowerJoint },
  stiffness: stiffnessMedium,
  length: 0,
  render: fixationRenderOptions,
});
Composite.add(stickman, leftArmConstraint);

// fix right arm
const rightArmPoint = { ...rightPoint };
const rightArmConstraint = Constraint.create({
  pointA: rightArmPoint,
  bodyB: lowerRightArm,
  pointB: { ...lowerJoint },
  stiffness: stiffnessMedium,
  length: 0,
  render: fixationRenderOptions,
});
Composite.add(stickman, rightArmConstraint);

const leftLegPoint = { ...lowerPoint };
const leftLegConstraint = Constraint.create({
  pointA: leftLegPoint,
  bodyB: lowerLeftLeg,
  pointB: { ...lowerJoint },
  stiffness: stiffnessMedium,
  length: 0,
  render: fixationRenderOptions,
});
Composite.add(stickman, leftLegConstraint);

// fix right Leg
const rightLegPoint = { ...lowerPoint };
const rightLegConstraint = Constraint.create({
  pointA: rightLegPoint,
  bodyB: lowerRightLeg,
  pointB: { ...lowerJoint },
  stiffness: stiffnessMedium,
  length: 0,
  render: fixationRenderOptions,
});
Composite.add(stickman, rightLegConstraint);

const connections = [
  {
    point: leftArmPoint,
    constraint: leftArmConstraint,
  }, {
    point: rightArmPoint,
    constraint: rightArmConstraint,
  }, {
    point: leftLegPoint,
    constraint: leftLegConstraint,
  }, {
    point: rightLegPoint,
    constraint: rightLegConstraint,
  }
];

Composite.add(world, cross);
Composite.add(world, stickman);

// fit the render viewport to the scene
Render.lookAt(render, {
  min: { x: 0, y: 0 },
  max: { x: width, y: height }
});

const pattern = [1, 2, 4, 4];
connect(...pattern);

setInterval(() => {
  const index = Math.floor(pattern.length * Math.random());
  pattern[index] = Math.floor(points.length * Math.random());
  connect(...pattern);
}, 4000);

function connect(...pattern) {
  for (let i = 0; i < connections.length; i++) {
    const connection = connections[i];

    if (i < pattern.length) {
      const index = pattern[i];

      if (index > 0 && index <= 4) {
        connection.constraint.stiffness = (index === 4) ? stiffnessMedium : stiffnessHigh;
        connection.point.x = points[index].x;
        connection.point.y = points[index].y;
        continue;
      }
    }

    connection.constraint.stiffness = stiffnessLow;
    connection.point.x = center.x;
    connection.point.y = center.y;
  }

  let str = '';

  for (let index of pattern) {
    str += index;
    str += ' ';
  }

  patternDisplay.innerText = str;
}

