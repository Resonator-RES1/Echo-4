import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useEditorLogic } from './useEditorLogic';
import { RefinedVersion } from '../types';

describe('useEditorLogic', () => {
    const mockProps = {
        draft: 'initial draft',
        setDraft: vi.fn(),
        currentSceneId: 'scene-1',
        setScenes: vi.fn(),
        versionHistory: [],
        onAddVersion: vi.fn(),
        onAcceptVersion: vi.fn(),
        setActiveTab: vi.fn(),
    };

    it('should initialize with the provided draft', () => {
        const { result } = renderHook(() => useEditorLogic(mockProps));
        expect(result.current.draftState.present).toBe('initial draft');
    });

    it('should handle new versions correctly', () => {
        const { result } = renderHook(() => useEditorLogic(mockProps));
        const newVersion: RefinedVersion = {
            id: 'v1',
            text: 'refined draft',
            timestamp: new Date().toISOString(),
            isSurgical: false,
        };

        act(() => {
            result.current.handleNewVersion(newVersion);
        });

        expect(mockProps.onAddVersion).toHaveBeenCalledWith(expect.objectContaining({
            id: 'v1',
            text: 'refined draft',
        }));
        expect(mockProps.setActiveTab).toHaveBeenCalledWith('report');
    });

    it('should handle accepting versions correctly', () => {
        const { result } = renderHook(() => useEditorLogic(mockProps));
        const version: RefinedVersion = {
            id: 'v1',
            text: 'accepted draft',
            timestamp: new Date().toISOString(),
            isSurgical: false,
        };

        act(() => {
            result.current.handleAcceptVersion(version);
        });

        expect(mockProps.onAcceptVersion).toHaveBeenCalledWith(version);
        expect(result.current.draftState.present).toBe('accepted draft');
        expect(mockProps.setActiveTab).toHaveBeenCalledWith('draft');
    });
});
