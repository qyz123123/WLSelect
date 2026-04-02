#!/usr/bin/env bash

set -euo pipefail

GITHUB_USERNAME="qyz123123"
GITHUB_EMAIL="m18396870715@gmail.com"
REPOSITORY_NAME="WLSelect"
REMOTE_NAME="origin"
REMOTE_URL="https://github.com/${GITHUB_USERNAME}/${REPOSITORY_NAME}.git"
DEFAULT_BRANCH="main"
COMMIT_MESSAGE="${1:-Initial upload to GitHub}"

log() {
  printf '[upload] %s\n' "$1"
}

fail() {
  printf '[upload] Error: %s\n' "$1" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Missing required command: $1"
}

create_repo_with_gh() {
  if ! command -v gh >/dev/null 2>&1; then
    log "GitHub CLI not found. Create ${REMOTE_URL} manually if it does not exist."
    return
  fi

  if ! gh auth status >/dev/null 2>&1; then
    log "GitHub CLI is not authenticated. Run 'gh auth login' if you want this script to create the repo automatically."
    return
  fi

  if gh repo view "${GITHUB_USERNAME}/${REPOSITORY_NAME}" >/dev/null 2>&1; then
    log "GitHub repository ${GITHUB_USERNAME}/${REPOSITORY_NAME} already exists."
    return
  fi

  log "Creating GitHub repository ${GITHUB_USERNAME}/${REPOSITORY_NAME}."
  gh repo create "${GITHUB_USERNAME}/${REPOSITORY_NAME}" --public --source=. --remote="${REMOTE_NAME}" --push=false
}

require_command git

if [[ ! -d .git ]]; then
  log "Initializing git repository."
  git init
fi

log "Configuring local git identity."
git config user.name "${GITHUB_USERNAME}"
git config user.email "${GITHUB_EMAIL}"

create_repo_with_gh

if git remote get-url "${REMOTE_NAME}" >/dev/null 2>&1; then
  current_remote_url="$(git remote get-url "${REMOTE_NAME}")"
  if [[ "${current_remote_url}" != "${REMOTE_URL}" ]]; then
    log "Updating ${REMOTE_NAME} remote to ${REMOTE_URL}."
    git remote set-url "${REMOTE_NAME}" "${REMOTE_URL}"
  else
    log "${REMOTE_NAME} remote already points to ${REMOTE_URL}."
  fi
else
  log "Adding ${REMOTE_NAME} remote ${REMOTE_URL}."
  git remote add "${REMOTE_NAME}" "${REMOTE_URL}"
fi

current_branch="$(git symbolic-ref --quiet --short HEAD 2>/dev/null || true)"
if [[ -z "${current_branch}" ]]; then
  current_branch="${DEFAULT_BRANCH}"
  log "Creating branch ${current_branch}."
  git checkout -b "${current_branch}"
fi

if [[ "${current_branch}" != "${DEFAULT_BRANCH}" ]]; then
  log "Switching branch from ${current_branch} to ${DEFAULT_BRANCH}."
  git checkout -B "${DEFAULT_BRANCH}"
else
  log "Using branch ${DEFAULT_BRANCH}."
fi

if [[ -n "$(git status --short)" ]]; then
  log "Staging changes."
  git add .

  if [[ -n "$(git diff --cached --name-only)" ]]; then
    log "Creating commit: ${COMMIT_MESSAGE}"
    git commit -m "${COMMIT_MESSAGE}"
  else
    log "Nothing new to commit after staging."
  fi
else
  log "Working tree is clean. No new commit needed."
fi

log "Pushing ${DEFAULT_BRANCH} to ${REMOTE_NAME}."
git push -u "${REMOTE_NAME}" "${DEFAULT_BRANCH}"

log "Repository upload complete."
