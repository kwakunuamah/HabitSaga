import React, { createContext, useContext, useState } from 'react';
import { Cadence, Theme } from '../../types';

interface WizardData {
    title: string;
    target_date: string;
    cadence: Cadence;
    theme: Theme;
    selfie_uri?: string;
}

interface WizardContextType {
    data: WizardData;
    updateData: (updates: Partial<WizardData>) => void;
    reset: () => void;
}

const defaultData: WizardData = {
    title: '',
    target_date: new Date().toISOString(),
    cadence: { type: 'daily' },
    theme: 'fantasy',
};

const WizardContext = createContext<WizardContextType>({
    data: defaultData,
    updateData: () => { },
    reset: () => { },
});

export const useWizard = () => useContext(WizardContext);

export const WizardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState<WizardData>(defaultData);

    const updateData = (updates: Partial<WizardData>) => {
        setData(prev => ({ ...prev, ...updates }));
    };

    const reset = () => setData(defaultData);

    return (
        <WizardContext.Provider value={{ data, updateData, reset }}>
            {children}
        </WizardContext.Provider>
    );
};
