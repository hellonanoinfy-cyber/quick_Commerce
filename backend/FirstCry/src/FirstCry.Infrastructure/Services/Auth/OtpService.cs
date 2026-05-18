// This file is intentionally replaced by:
//   RedisOtpService.cs  — Redis-backed implementation (used when Redis is available)
//   InMemoryOtpService.cs — In-memory fallback (used when Redis is unavailable)
//
// The selection is made automatically in DependencyInjection.cs at startup.
// Do NOT add code here — keep Clean Architecture separation.
