import { convertTimeToAngle, calculateAngles } from "../utils/calculate";

test("0 h => 0 deg", () => {
  let time = {h: 0, m: 0}
  const res = convertTimeToAngle(time);
  expect(res).toBe(0);
});

test("1 h => 30 deg", () => {
  let time = {h: 1, m: 0}
  const res = convertTimeToAngle(time);
  expect(res).toBe(30);
});

test("2 h => 60 deg", () => {
  let time = {h: 2, m: 0}
  const res = convertTimeToAngle(time);
  expect(res).toBe(60);
});

test("3 h => 90 deg", () => {
  let time = {h: 3, m: 0}
  const res = convertTimeToAngle(time);
  expect(res).toBe(90);
});

test("6 h => 180 deg", () => {
  let time = {h: 6, m: 0}
  const res = convertTimeToAngle(time);
  expect(res).toBe(180);
});

test("9 h => 270 deg", () => {
  let time = {h: 9, m: 0}
  const res = convertTimeToAngle(time);
  expect(res).toBe(270);
});

test("12 h => 0 deg", () => {
  let time = {h: 12, m: 0}
  const res = convertTimeToAngle(time);
  expect(res).toBe(0);
});

// Тесты для минут (12-часовой формат)
test("0 h 15 min => 7.5 deg", () => {
  let time = {h: 0, m: 15}
  const res = convertTimeToAngle(time);
  expect(res).toBe(7.5);
});

test("0 h 30 min => 15 deg", () => {
  let time = {h: 0, m: 30}
  const res = convertTimeToAngle(time);
  expect(res).toBe(15);
});

test("0 h 45 min => 22.5 deg", () => {
  let time = {h: 0, m: 45}
  const res = convertTimeToAngle(time);
  expect(res).toBe(22.5);
});

// Тесты для часов и минут вместе (12-часовой формат)
test("1 h 30 min => 45 deg", () => {
  let time = {h: 1, m: 30}
  const res = convertTimeToAngle(time);
  expect(res).toBe(45);
});

test("2 h 15 min => 67.5 deg", () => {
  let time = {h: 2, m: 15}
  const res = convertTimeToAngle(time);
  expect(res).toBe(67.5);
});

test("3 h 20 min => 100 deg", () => {
  let time = {h: 3, m: 20}
  const res = convertTimeToAngle(time);
  expect(res).toBe(100);
});

test("5 h 45 min => 172.5 deg", () => {
  let time = {h: 5, m: 45}
  const res = convertTimeToAngle(time);
  expect(res).toBe(172.5);
});

test("9 h 10 min => 275 deg", () => {
  let time = {h: 9, m: 10}
  const res = convertTimeToAngle(time);
  expect(res).toBe(275);
});

test("11 h 59 min => 359.5 deg", () => {
  let time = {h: 11, m: 59}
  const res = convertTimeToAngle(time);
  expect(res).toBe(359.5);
});

// Тесты для времени после 12 часов (12-часовой формат)
test("13 h (1 PM) => 30 deg", () => {
  let time = {h: 13, m: 0}
  const res = convertTimeToAngle(time);
  expect(res).toBe(30);
});

test("14 h (2 PM) => 60 deg", () => {
  let time = {h: 14, m: 0}
  const res = convertTimeToAngle(time);
  expect(res).toBe(60);
});

test("15 h 30 min (3:30 PM) => 105 deg", () => {
  let time = {h: 15, m: 30}
  const res = convertTimeToAngle(time);
  expect(res).toBe(105);
});

test("23 h (11 PM) => 330 deg", () => {
  let time = {h: 23, m: 0}
  const res = convertTimeToAngle(time);
  expect(res).toBe(330);
});

// Граничные случаи
test("24 h (midnight) => 0 deg", () => {
  let time = {h: 24, m: 0}
  const res = convertTimeToAngle(time);
  expect(res).toBe(0);
});


// Тесты для функции calculateAngles с новым форматом данных
test("calculateAngles for event 13:00-14:00 (1PM-2PM)", () => {
  const event = { 
    start: {h: 13, m: 0}, 
    end: {h: 14, m: 0} 
  };
  const angles = calculateAngles(event);
  expect(angles.startAngle).toBe(30);
  expect(angles.endAngle).toBe(60);
});

test("calculateAngles for event 09:30-10:45 (9:30AM-10:45AM)", () => {
  const event = { 
    start: {h: 9, m: 30}, 
    end: {h: 10, m: 45} 
  };
  const angles = calculateAngles(event);
  expect(angles.startAngle).toBe(285);
  expect(angles.endAngle).toBe(322.5);
});

test("calculateAngles for overnight event 23:00-01:00 (11PM-1AM)", () => {
  const event = { 
    start: {h: 23, m: 0}, 
    end: {h: 1, m: 0} 
  };
  const angles = calculateAngles(event);
  expect(angles.startAngle).toBe(-30);
  expect(angles.endAngle).toBe(30);
});

test("calculateAngles for event 11:30-12:45", () => {
  const event = { 
    start: {h: 11, m: 30}, 
    end: {h: 12, m: 45} 
  };
  const angles = calculateAngles(event);
  expect(angles.startAngle).toBe(-15);
  expect(angles.endAngle).toBe(22.5);
});

test("calculateAngles for event 15:20-16:40 (3:20PM-4:40PM)", () => {
  const event = { 
    start: {h: 15, m: 20}, 
    end: {h: 16, m: 40} 
  };
  const angles = calculateAngles(event);
  expect(angles.startAngle).toBe(100);
  expect(angles.endAngle).toBe(140);
});

test("calculateAngles for event 08:15-09:05 (8:15AM-9:05AM)", () => {
  const event = { 
    start: {h: 8, m: 15}, 
    end: {h: 9, m: 5} 
  };
  const angles = calculateAngles(event);
  expect(angles.startAngle).toBe(247.5);
  expect(angles.endAngle).toBe(272.5);
});

test("calculateAngles for event 17:00-17:00 (5PM-5PM) - zero duration", () => {
  const event = { 
    start: {h: 17, m: 0}, 
    end: {h: 17, m: 0} 
  };
  const angles = calculateAngles(event);
  expect(angles.startAngle).toBe(150);
  expect(angles.endAngle).toBe(150);
});

test("calculateAngles for event 22:45-00:15 (10:45PM-12:15AM)", () => {
  const event = { 
    start: {h: 22, m: 45}, 
    end: {h: 0, m: 15} 
  };
  const angles = calculateAngles(event);
  expect(angles.startAngle).toBe(-37.5);
  expect(angles.endAngle).toBe(7.5);
});