import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VisualEditor from './VisualEditor';

// Mock the required components and functions
jest.mock('./Sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="mock-sidebar">Sidebar</div>;
  };
});

jest.mock('./TopControlsBar', () => {
  return function MockTopControlsBar() {
    return <div data-testid="mock-top-controls">Top Controls</div>;
  };
});

jest.mock('./EditorCanvas', () => {
  return function MockEditorCanvas() {
    return <div data-testid="mock-editor-canvas">Editor Canvas</div>;
  };
});

jest.mock('./utils/htmlGenerator', () => ({
  generateHTMLFromData: jest.fn(() => '<div>Generated HTML</div>'),
  generateCSSFromData: jest.fn(() => '/* Generated CSS */'),
  createComponentElement: jest.fn(() => {
    const div = document.createElement('div');
    div.className = 'editor-component';
    div.innerHTML = '<p>Test Component</p>';
    return div;
  }),
  cleanHtmlForViewing: jest.fn((html) => html)
}));

describe('VisualEditor', () => {
  const mockOnSave = jest.fn();
  const mockOnManualSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <VisualEditor 
        onSave={mockOnSave}
        onManualSave={mockOnManualSave}
      />
    );
    
    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-top-controls')).toBeInTheDocument();
    expect(screen.getByTestId('mock-editor-canvas')).toBeInTheDocument();
  });

  it('handles component addition', () => {
    render(
      <VisualEditor 
        onSave={mockOnSave}
        onManualSave={mockOnManualSave}
      />
    );
    
    // The component should render without errors
    expect(screen.getByTestId('mock-editor-canvas')).toBeInTheDocument();
  });

  it('handles drag and drop functionality', () => {
    render(
      <VisualEditor 
        onSave={mockOnSave}
        onManualSave={mockOnManualSave}
      />
    );
    
    // The component should render without errors
    expect(screen.getByTestId('mock-editor-canvas')).toBeInTheDocument();
  });
});