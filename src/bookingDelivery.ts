export function assertDeliveryAcknowledged(httpOk: boolean, payload: unknown): void {
  const success = payload && typeof payload === 'object' && 'success' in payload ? payload.success : undefined;
  if (!httpOk || !(success === true || success === 'true')) throw new Error('Delivery was not acknowledged');
}

export function validBookingDates(arrival: string, departure: string): boolean {
  return !arrival || !departure || departure > arrival;
}
