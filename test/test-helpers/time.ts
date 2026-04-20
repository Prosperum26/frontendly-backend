export function fakeSystemTime(date: Date): void {
  // See: https://stackoverflow.com/questions/75591009/test-gets-stuck-when-using-jest-usefaketimers-during-a-database-async-operatio
  jest.useFakeTimers({ now: date, doNotFake: ['nextTick'] });
}
