## Final Feature Specification: `RocketLauncherGameObject`

Location:

```txt
C:\Users\danha\source\repos\HTML\MonoRepro\Applications\game\game-objects\src\Trackers
```

---

# Rocket Launcher / Rocket System

## Purpose

`RocketLauncherGameObject` observes a `MouseGameObject`.

When the mouse is close enough to the launcher, the launcher creates or reuses a `Rocket`.

A `Rocket` is a short-lived physical object. It moves in a straight line from the launcher toward the mouse position captured at launch time.

Existing rockets must continue their animation until their lifetime expires. The launcher may stop creating new rockets when the mouse is no longer detected, but it must never stop already launched rockets.

---

# Contracts

It owns:

```ts
startPosition: Vector2
position: Vector2
velocity: Vector2
acceleration: Vector2
```

Movement formula:

```ts
position(t) = startPosition
            + velocity * t
            + 0.5 * acceleration * t²
```

Component form:

```ts
Px = P0x + Vx * t + 0.5 * Ax * t²
Py = P0y + Vy * t + 0.5 * Ay * t²
```

Where:

```ts
t = elapsedLifetimeSeconds
```

---

## `Rocket`
 
A rocket is reusable. It must never be destroyed as part of normal lifetime expiry.

### State

```ts
startPosition: Vector2
position: Vector2
direction: Vector2
velocity: Vector2
acceleration: Vector2

lifetimeSeconds: number
elapsedLifetimeSeconds: number
startedAt: number

active: boolean
visible: boolean
```

---

## `Rocket.start(...)`

When a rocket starts:

```ts
direction = normalize(targetPosition - launcherPosition)
velocity = direction * initialSpeed
acceleration = direction * accelerationMagnitude
```

Then:

```ts
startPosition = launcherPosition
position = launcherPosition
elapsedLifetimeSeconds = 0
startedAt = currentTime
active = true
visible = true
```

The direction is a snapshot. It must not change if the mouse moves later.

---

## `Rocket.update(deltaTimeSeconds)`

When updated:

```ts
elapsedLifetimeSeconds += deltaTimeSeconds
```

If:

```ts
elapsedLifetimeSeconds < lifetimeSeconds
```

then:

```ts
active = true
visible = true
position = startPosition
         + velocity * elapsedLifetimeSeconds
         + 0.5 * acceleration * elapsedLifetimeSeconds²
```

If:

```ts
elapsedLifetimeSeconds >= lifetimeSeconds
```

then:

```ts
elapsedLifetimeSeconds = lifetimeSeconds
active = false
visible = false
position = final lifetime position
```

Expired rockets stop updating, become invisible, and remain available for reuse.

---

## `Rocket.getVelocityVector()`

```ts
getVelocityVector(): Vector2
```

Returns the **initial launch velocity vector**:

```ts
direction * initialSpeed
```

It does not include acceleration and does not change over time.

---

## `Rocket.getPosition()`

```ts
getPosition(): Vector2
```

Returns the current calculated rocket position.

---

# `RocketLauncherGameObject`

## Responsibility

`RocketLauncherGameObject` observes `MouseGameObject`.

It creates or reuses rockets when:

```ts
distance(launcher.position, mouse.position) <= detectionRadius
```

and cooldown has elapsed.

---

## Creation rules

A rocket may be launched only when all conditions are true:

```ts
mouse is detected
distance <= detectionRadius
cooldown elapsed
```

When launching:

1. Use an inactive rocket from the pool if one exists.
2. Otherwise create a new rocket if pool size is below `maxRockets`.
3. Otherwise reuse the oldest active rocket.
4. Oldest active rocket means the active rocket with the smallest `startedAt`.
5. Rocket starts at the launcher position.
6. Rocket direction is calculated from launcher position to mouse position at launch time.
7. Rocket continues independently until lifetime expires.

---

## Pooling contract

```ts
inactiveRocket = first rocket where active === false
```

If none exists and:

```ts
rocketPool.length < maxRockets
```

then create a new rocket.

If pool is full:

```ts
reuse rocket with smallest startedAt
```

The reused rocket is restarted with new launch parameters.

---

## Cooldown contract

The launcher stores the last launch time.

A new rocket can be launched only when:

```ts
currentTime - lastLaunchTime >= cooldownSeconds
```

Cooldown affects only creation of new rockets. It must not affect already active rockets.

---

# Final behavior rules

## Rocket

* Rocket starts visible.
* Rocket remains visible while:

```ts
elapsedLifetimeSeconds < lifetimeSeconds
```

* Rocket becomes invisible exactly when:

```ts
elapsedLifetimeSeconds >= lifetimeSeconds
```

* Rocket is not destroyed.
* Rocket is not permanently disabled.
* Rocket can be restarted and reused.
* Rocket moves in a straight line.
* Rocket direction is fixed at launch time.
* Rocket acceleration is scalar acceleration along launch direction.
* Rocket final position is clamped at `lifetimeSeconds`.

---

## RocketLauncherGameObject

* Creates rocket only when mouse is detected and inside radius.
* Does not create rocket when mouse is outside radius.
* Does not create rocket while cooldown is active.
* Does not stop active rockets when mouse leaves radius.
* Reuses inactive rockets before creating new ones.
* Reuses oldest active rocket when pool is full.
* Launch direction is calculated once at creation time.

---

# Unit Tests

## Rocket tests

### 1. Rocket starts at launcher position

Expected:

```ts
rocket.getPosition() === launcherPosition
```

immediately after `start`.

---

### 2. Rocket is visible while lifetime is not expired

Given:

```ts
lifetimeSeconds = 1
elapsedLifetimeSeconds = 0.5
```

Expected:

```ts
rocket.isVisible() === true
rocket.isActive() === true
```

---

### 3. Rocket becomes invisible when lifetime expires

Given:

```ts
lifetimeSeconds = 1
elapsedLifetimeSeconds = 1
```

Expected:

```ts
rocket.isVisible() === false
rocket.isActive() === false
```

---

### 4. Rocket moves using physical formula

Expected position:

```ts
expected =
  startPosition +
  velocity * t +
  0.5 * acceleration * t²
```

Actual:

```ts
rocket.getPosition()
```

must equal expected within floating point tolerance.

---

### 5. Rocket direction is fixed at launch

After launch, moving the mouse must not change rocket movement direction.

---

### 6. Rocket velocity vector is initial launch velocity

Expected:

```ts
rocket.getVelocityVector() === normalizedDirection * initialSpeed
```

This value must not change after updates.

---

### 7. Rocket acceleration increases movement along direction

Given positive `accelerationMagnitude`, displacement after update must be greater than movement with velocity alone.

---

### 8. Expired rocket can be reused

After lifetime expires:

```ts
rocket.isActive() === false
rocket.isVisible() === false
```

After calling `start(...)` again:

```ts
rocket.isActive() === true
rocket.isVisible() === true
rocket.elapsedLifetimeSeconds === 0
rocket.position === newStartPosition
```

---

## RocketLauncherGameObject tests

### 1. Creates rocket when mouse is inside radius

Given:

```ts
distance(launcher, mouse) <= detectionRadius
```

Expected:

```ts
rocketPool.length === 1
rocket.isActive() === true
```

---

### 2. Does not create rocket when mouse is outside radius

Given:

```ts
distance(launcher, mouse) > detectionRadius
```

Expected:

```ts
rocketPool.length === 0
```

---

### 3. Rocket starts at launcher position

Expected:

```ts
rocket.getPosition() === launcher.getPosition()
```

at launch time.

---

### 4. Rocket direction points from launcher to mouse

Expected:

```ts
rocket.direction === normalize(mousePosition - launcherPosition)
```

using the mouse position at launch time.

---

### 5. Cooldown prevents spam

If launcher updates multiple times before cooldown expires:

```ts
rocketPool.length === 1
```

---

### 6. Existing rockets continue after mouse leaves radius

Given a rocket is active.

When mouse moves outside radius.

Expected:

```ts
rocket.update(deltaTime)
rocket position changes
rocket remains active until lifetime expires
```

---

### 7. Reuses inactive rockets first

Given one expired rocket exists.

When launcher fires again.

Expected:

```ts
same rocket instance is restarted
rocketPool.length does not increase
```

---

### 8. Reuses oldest active rocket when pool is full

Given:

```ts
rocketPool.length === maxRockets
all rockets active
```

When launcher fires again.

Expected:

```ts
rocket with smallest startedAt is restarted
```

---

# Final deterministic formulas

```ts
direction = normalize(mousePosition - launcherPosition)

velocity = direction * initialSpeed

acceleration = direction * accelerationMagnitude

position =
  startPosition +
  velocity * elapsedLifetimeSeconds +
  0.5 * acceleration * elapsedLifetimeSeconds²
```

Lifecycle:

```ts
visible = elapsedLifetimeSeconds < lifetimeSeconds
active = elapsedLifetimeSeconds < lifetimeSeconds
```

Pool reuse priority:

```ts
inactive rocket
  ?? create new rocket if pool not full
  ?? oldest active rocket
```

The RocketLauncherGameObject should change color when the Mouse GameObject is detected and within the detection radius, and revert to its original color when the Mouse GameObject is not detected or outside the detection radius.

The Rocket Launcher should have a cooldown period between launches on 0.5sec, during which it cannot launch new rockets. It should shoot a rocket every 0.5 seconds when the mouse is detected and within the detection radius.

There must be more than 1 rocket in the pool, so that we can test reuse of active rockets when the pool is full. Preferably at least 10 rockets in the pool, so that we can test reuse of the oldest active rocket when the pool is full.   
