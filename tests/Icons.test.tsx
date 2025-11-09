/**
 * Icons Component Tests
 * Tests for icon rendering
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    CheckBadgeIcon,
    AlertTriangleIcon,
    SunIcon,
    ClipboardDocumentListIcon,
    PaperClipIcon,
    WandSparklesIcon,
    ArrowPathIcon,
    PencilIcon,
    ListBulletIcon,
    BuildingOfficeIcon,
    UsersIcon,
    MapPinIcon,
    MagnifyingGlassIcon,
    MagnifyingGlassPlusIcon,
    MagnifyingGlassMinusIcon,
    LineIcon,
    RectangleIcon,
    CursorArrowRaysIcon,
    TrashIcon,
    CameraIcon,
    PlusIcon,
    BellIcon,
    CheckIcon,
    ClockIcon,
    CalendarDaysIcon,
    FileIcon
} from '../components/Icons';

describe('Icons Component', () => {
    it('should render ChevronLeftIcon with custom className', () => {
        const { container } = render(<ChevronLeftIcon className="test-class" />);
        const svg = container.querySelector('svg');
        expect(svg).toBeTruthy();
        expect(svg?.classList.contains('test-class')).toBe(true);
    });

    it('should render navigation icons', () => {
        const { container: left } = render(<ChevronLeftIcon />);
        expect(left.querySelector('svg')).toBeTruthy();

        const { container: right } = render(<ChevronRightIcon />);
        expect(right.querySelector('svg')).toBeTruthy();
    });

    it('should render status and notification icons', () => {
        const { container: check } = render(<CheckBadgeIcon />);
        expect(check.querySelector('svg')).toBeTruthy();

        const { container: alert } = render(<AlertTriangleIcon />);
        expect(alert.querySelector('svg')).toBeTruthy();

        const { container: bell } = render(<BellIcon />);
        expect(bell.querySelector('svg')).toBeTruthy();

        const { container: checkSimple } = render(<CheckIcon />);
        expect(checkSimple.querySelector('svg')).toBeTruthy();
    });

    it('should render utility icons', () => {
        const { container: clipboard } = render(<ClipboardDocumentListIcon />);
        expect(clipboard.querySelector('svg')).toBeTruthy();

        const { container: paperclip } = render(<PaperClipIcon />);
        expect(paperclip.querySelector('svg')).toBeTruthy();

        const { container: wand } = render(<WandSparklesIcon />);
        expect(wand.querySelector('svg')).toBeTruthy();

        const { container: plus } = render(<PlusIcon />);
        expect(plus.querySelector('svg')).toBeTruthy();
    });

    it('should render action icons', () => {
        const { container: arrow } = render(<ArrowPathIcon />);
        expect(arrow.querySelector('svg')).toBeTruthy();

        const { container: pencil } = render(<PencilIcon />);
        expect(pencil.querySelector('svg')).toBeTruthy();

        const { container: trash } = render(<TrashIcon />);
        expect(trash.querySelector('svg')).toBeTruthy();
    });

    it('should render list and organization icons', () => {
        const { container: list } = render(<ListBulletIcon />);
        expect(list.querySelector('svg')).toBeTruthy();

        const { container: building } = render(<BuildingOfficeIcon />);
        expect(building.querySelector('svg')).toBeTruthy();

        const { container: users } = render(<UsersIcon />);
        expect(users.querySelector('svg')).toBeTruthy();
    });

    it('should render location and search icons', () => {
        const { container: map } = render(<MapPinIcon />);
        expect(map.querySelector('svg')).toBeTruthy();

        const { container: search } = render(<MagnifyingGlassIcon />);
        expect(search.querySelector('svg')).toBeTruthy();

        const { container: searchPlus } = render(<MagnifyingGlassPlusIcon />);
        expect(searchPlus.querySelector('svg')).toBeTruthy();

        const { container: searchMinus } = render(<MagnifyingGlassMinusIcon />);
        expect(searchMinus.querySelector('svg')).toBeTruthy();
    });

    it('should render shape and cursor icons', () => {
        const { container: line } = render(<LineIcon />);
        expect(line.querySelector('svg')).toBeTruthy();

        const { container: rectangle } = render(<RectangleIcon />);
        expect(rectangle.querySelector('svg')).toBeTruthy();

        const { container: cursor } = render(<CursorArrowRaysIcon />);
        expect(cursor.querySelector('svg')).toBeTruthy();
    });

    it('should render media and time icons', () => {
        const { container: camera } = render(<CameraIcon />);
        expect(camera.querySelector('svg')).toBeTruthy();

        const { container: sun } = render(<SunIcon />);
        expect(sun.querySelector('svg')).toBeTruthy();

        const { container: clock } = render(<ClockIcon />);
        expect(clock.querySelector('svg')).toBeTruthy();

        const { container: calendar } = render(<CalendarDaysIcon />);
        expect(calendar.querySelector('svg')).toBeTruthy();

        const { container: file } = render(<FileIcon />);
        expect(file.querySelector('svg')).toBeTruthy();
    });

    it('should render icons with title prop', () => {
        const { container } = render(<CheckBadgeIcon title="Verified" />);
        const svg = container.querySelector('svg');
        const title = svg?.querySelector('title');
        expect(title?.textContent).toBe('Verified');
    });

    it('should apply custom className', () => {
        const customClass = 'custom-icon-class text-blue-500';
        const { container } = render(<PlusIcon className={customClass} />);
        const svg = container.querySelector('svg');
        expect(svg?.classList.contains('custom-icon-class')).toBe(true);
        expect(svg?.classList.contains('text-blue-500')).toBe(true);
    });
});
