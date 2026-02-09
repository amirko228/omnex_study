import { cn } from './utils';

describe('utils', () => {
    describe('cn', () => {
        it('should merge class names correctly', () => {
            const result = cn('text-red-500', 'bg-blue-500');
            expect(result).toBe('text-red-500 bg-blue-500');
        });

        it('should handle conditional classes', () => {
            const result = cn('text-red-500', undefined, null, false && 'hidden', 'bg-blue-500');
            expect(result).toBe('text-red-500 bg-blue-500');
        });

        it('should merge tailwind classes using tailwind-merge', () => {
            // p-4 should overwrite p-2
            const result = cn('p-2', 'p-4');
            expect(result).toBe('p-4');
        });
    });
});
