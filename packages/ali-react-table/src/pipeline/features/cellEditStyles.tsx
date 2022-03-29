import React from 'react'
import styled from "styled-components";

export const Classes = {
  errorClass: 'art-cell-error'
}

const Z = {
  error: 8,
  focus: 9
}

export default styled.div`
  --art-cell-color-edit-active: #40a9ff;
  --art-cell-color-edit-outline: rgba(24, 144, 255, .2);
  --art-cell-color-error: #ff4d4f;
  --art-cell-color-error-outline: rgba(255, 77, 79, .2);

  width: 100%;
  height: 100%;
  outline: none;
  position: relative;

  &::before {
    content: attr(data-tip);
    padding: 0 10px;
    line-height: 24px;
    position: absolute;
    bottom: -23px;
    left: 0;
    z-index: -1;
    font-size: 12px;
    border-radius: 0 0 4px 4px;
    color: #fff;
    background-color: var(--art-cell-color-error);
    white-space: nowrap;
    transform: translateY(-100%);
    transition: transform .2s ease;
  }

  &.art-cell-error {
    z-index: ${Z.error};

    &::before {
      transform: translateY(0);
    }

    .art-cell-input {
      box-shadow:
        0 0 0 1px var(--art-cell-color-error) inset,
        0 0 0 2px var(--art-cell-color-error-outline);
    }
  }

  .art-cell-input {
    width: 100%;
    height: 100%;
    padding: 8px 12px;
    font-size: 12px;
    line-height: 1.4;
    border: none;
    outline: none;
    white-space: pre-wrap;
    background-color: transparent;
    transition: box-shadow .3s;
    cursor: inherit;
    pointer-events: none;
  }

  &.highlight {
    .art-cell-input {
      position: relative;
      cursor: text;
      -webkit-user-modify: read-write-plaintext-only;
      pointer-events: auto;

      &:focus {
        box-shadow:
          0 0 0 1px var(--art-cell-color-edit-active) inset,
          0 0 0 2px var(--art-cell-color-edit-outline);
        background-color: #fff !important;
        z-index: ${Z.focus};
      }
    }
  }
`
