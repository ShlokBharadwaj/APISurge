import React from 'react';
import { createRoot } from 'react-dom/client';
import { render, screen, act } from '@testing-library/react';
import UserDataTable from './UserDataTable';

describe('UserDataTable', () => {
  test('renders loading text when loading is true', async () => {
    await act(async () => {
      const root = document.createElement('div');
      createRoot(root).render(<UserDataTable />);

      const loadingElement = await screen.findByText(/Loading.../i);
      expect(loadingElement).toBeInTheDocument();
    });
  });

  test('renders the table with correct headers', () => {
    act(() => {
      const root = document.createElement('div');
      createRoot(root).render(<UserDataTable />);

      const idHeader = screen.getByText(/ID/i);
      const nameHeader = screen.getByText(/Name/i);
      const usernameHeader = screen.getByText(/UserName/i);
      const emailHeader = screen.getByText(/Email/i);

      expect(idHeader).toBeInTheDocument();
      expect(nameHeader).toBeInTheDocument();
      expect(usernameHeader).toBeInTheDocument();
      expect(emailHeader).toBeInTheDocument();
    });
  });

});
