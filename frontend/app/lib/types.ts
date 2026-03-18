export interface ExecutionResult {
  stdout: string;
  stderr: string;
  returncode: number;
  success: boolean;
  timed_out: boolean;
}

export interface Tab {
  id: string;
  name: string;
  code: string;
  result: ExecutionResult | null;
  error: string | null;
}
