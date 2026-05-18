# ══════════════════════════════════════════════════
# Backend Dockerfile — .NET 8 Multi-stage Build
# ══════════════════════════════════════════════════

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY backend/FirstCry/src/FirstCry.Domain/FirstCry.Domain.csproj src/FirstCry.Domain/
COPY backend/FirstCry/src/FirstCry.Application/FirstCry.Application.csproj src/FirstCry.Application/
COPY backend/FirstCry/src/FirstCry.Infrastructure/FirstCry.Infrastructure.csproj src/FirstCry.Infrastructure/
COPY backend/FirstCry/src/FirstCry.API/FirstCry.API.csproj src/FirstCry.API/

RUN dotnet restore src/FirstCry.API/FirstCry.API.csproj

COPY backend/FirstCry/src/ ./src/
RUN dotnet publish src/FirstCry.API/FirstCry.API.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /app/publish .

RUN adduser --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

EXPOSE 8080

ENTRYPOINT ["dotnet", "FirstCry.API.dll"]
