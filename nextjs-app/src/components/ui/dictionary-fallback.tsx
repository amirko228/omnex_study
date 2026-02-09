'use client';

/**
 * Универсальный fallback-компонент для отображения загрузки 
 * когда словарь (dict) ещё не загружен
 */
export function DictionaryFallback() {
    return (
        <div className="container mx-auto px-4 py-10 flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
                <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">Загрузка...</p>
            </div>
        </div>
    );
}

/**
 * HOC для обёртки компонентов с проверкой dict
 */
export function withDictionaryCheck<P extends { dict: any }>(
    Component: React.ComponentType<P>
): React.FC<P> {
    return function WrappedComponent(props: P) {
        if (!props.dict) {
            return <DictionaryFallback />;
        }
        return <Component {...props} />;
    };
}
