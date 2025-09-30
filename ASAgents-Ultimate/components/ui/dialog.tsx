import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../lib/utils';

const DialogContext = createContext<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
}>({
    open: false,
    onOpenChange: () => { },
});

interface DialogProps {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const Dialog: React.FC<DialogProps> = ({ children, open, onOpenChange }) => {
    const [internalOpen, setInternalOpen] = useState(false);

    const isOpen = open ?? internalOpen;
    const setOpen = onOpenChange ?? setInternalOpen;

    return (
        <DialogContext.Provider value={{ open: isOpen, onOpenChange: setOpen }}>
            {children}
        </DialogContext.Provider>
    );
};

interface DialogTriggerProps {
    children: React.ReactNode;
    asChild?: boolean;
}

const DialogTrigger: React.FC<DialogTriggerProps> = ({ children, asChild }) => {
    const { onOpenChange } = useContext(DialogContext);

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            onClick: () => onOpenChange(true)
        } as any);
    }

    return (
        <button onClick={() => onOpenChange(true)}>
            {children}
        </button>
    );
};

interface DialogContentProps {
    children: React.ReactNode;
    className?: string;
}

const DialogContent: React.FC<DialogContentProps> = ({ children, className }) => {
    const { open, onOpenChange } = useContext(DialogContext);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <button
                className="fixed inset-0 bg-black bg-opacity-50"
                onClick={() => onOpenChange(false)}
                onKeyDown={(e) => e.key === 'Escape' && onOpenChange(false)}
                aria-label="Close dialog"
            />
            <div className={cn(
                "relative z-50 bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4",
                className
            )}>
                {children}
            </div>
        </div>
    );
};

interface DialogHeaderProps {
    children: React.ReactNode;
    className?: string;
}

const DialogHeader: React.FC<DialogHeaderProps> = ({ children, className }) => (
    <div className={cn("space-y-1.5 text-center sm:text-left", className)}>
        {children}
    </div>
);

interface DialogTitleProps {
    children: React.ReactNode;
    className?: string;
}

const DialogTitle: React.FC<DialogTitleProps> = ({ children, className }) => (
    <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
        {children}
    </h2>
);

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle };