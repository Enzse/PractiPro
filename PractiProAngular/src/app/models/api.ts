/**
 * The envelope most API endpoints wrap their data in (see backend Response::payload).
 */
export interface ApiResponse<T> {
  status: {
    remarks: 'success' | 'failed';
    message: string;
  };
  payload: T;
  timestamp: string;
}

/** A response to a create/update/delete request, which carries no data. */
export type ApiMessage = ApiResponse<null>;

/** MySQL DECIMAL and DATE columns arrive as strings. */
export type Decimal = string;
export type DateString = string;
export type TimeString = string;

/** Approval states used across submissions. */
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | 'Unsubmitted' | null;
