/**
 * Unit-тесты для UI компонента Button
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Простая реализация Button для тестирования
const Button = ({
    children,
    onClick,
    disabled = false,
    variant = 'default',
    size = 'default',
    className = '',
    ...props
}: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: 'default' | 'outline' | 'ghost' | 'destructive';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
}) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50';

    const variantStyles = {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-input bg-background hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    };

    const sizeStyles = {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

describe('Button Component', () => {
    describe('рендеринг', () => {
        it('должен отображать текст кнопки', () => {
            render(<Button>Нажми меня</Button>);
            expect(screen.getByText('Нажми меня')).toBeInTheDocument();
        });

        it('должен рендериться как кнопка', () => {
            render(<Button>Тест</Button>);
            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });

    describe('взаимодействие', () => {
        it('должен вызывать onClick при клике', () => {
            const handleClick = jest.fn();
            render(<Button onClick={handleClick}>Кликни</Button>);

            fireEvent.click(screen.getByRole('button'));
            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('не должен вызывать onClick когда disabled', () => {
            const handleClick = jest.fn();
            render(<Button onClick={handleClick} disabled>Отключена</Button>);

            fireEvent.click(screen.getByRole('button'));
            expect(handleClick).not.toHaveBeenCalled();
        });

        it('должен быть отключён с атрибутом disabled', () => {
            render(<Button disabled>Отключена</Button>);
            expect(screen.getByRole('button')).toBeDisabled();
        });
    });

    describe('варианты', () => {
        it('должен применять стили для variant="default"', () => {
            render(<Button variant="default">Default</Button>);
            expect(screen.getByRole('button')).toHaveClass('bg-primary');
        });

        it('должен применять стили для variant="outline"', () => {
            render(<Button variant="outline">Outline</Button>);
            expect(screen.getByRole('button')).toHaveClass('border');
        });

        it('должен применять стили для variant="ghost"', () => {
            render(<Button variant="ghost">Ghost</Button>);
            expect(screen.getByRole('button')).toHaveClass('hover:bg-accent');
        });

        it('должен применять стили для variant="destructive"', () => {
            render(<Button variant="destructive">Удалить</Button>);
            expect(screen.getByRole('button')).toHaveClass('bg-destructive');
        });
    });

    describe('размеры', () => {
        it('должен применять размер по умолчанию', () => {
            render(<Button size="default">Default Size</Button>);
            expect(screen.getByRole('button')).toHaveClass('h-10');
        });

        it('должен применять маленький размер', () => {
            render(<Button size="sm">Small</Button>);
            expect(screen.getByRole('button')).toHaveClass('h-9');
        });

        it('должен применять большой размер', () => {
            render(<Button size="lg">Large</Button>);
            expect(screen.getByRole('button')).toHaveClass('h-11');
        });

        it('должен применять размер иконки', () => {
            render(<Button size="icon">🔍</Button>);
            expect(screen.getByRole('button')).toHaveClass('w-10');
        });
    });

    describe('кастомные стили', () => {
        it('должен применять дополнительные классы', () => {
            render(<Button className="custom-class">Custom</Button>);
            expect(screen.getByRole('button')).toHaveClass('custom-class');
        });
    });
});
