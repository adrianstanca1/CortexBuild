import React, { useMemo } from 'react';

interface DiffViewerProps {
  oldText: string;
  newText: string;
}

interface DiffLine {
  type: 'added' | 'removed' | 'same';
  text: string;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ oldText, newText }) => {
  const diff = useMemo((): DiffLine[] => {
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');
    const result: DiffLine[] = [];

    let oldIndex = 0;
    let newIndex = 0;

    while (newIndex < newLines.length || oldIndex < oldLines.length) {
      if (oldIndex < oldLines.length && newIndex < newLines.length && oldLines[oldIndex] === newLines[newIndex]) {
        result.push({ type: 'same', text: newLines[newIndex] });
        oldIndex++;
        newIndex++;
      } else {
        const oldLineInNew = oldIndex < oldLines.length ? newLines.indexOf(oldLines[oldIndex], newIndex) : -1;
        const newLineInOld = newIndex < newLines.length ? oldLines.indexOf(newLines[newIndex], oldIndex) : -1;

        if (oldLineInNew !== -1 && (oldLineInNew <= newIndex || newLineInOld === -1)) {
          // Lines were added before this line
          while (newIndex < oldLineInNew) {
            result.push({ type: 'added', text: newLines[newIndex] });
            newIndex++;
          }
        } else if (newLineInOld !== -1) {
          // Lines were removed before this line
           while (oldIndex < newLineInOld) {
            result.push({ type: 'removed', text: oldLines[oldIndex] });
            oldIndex++;
          }
        } else {
          if (oldIndex < oldLines.length) {
            result.push({ type: 'removed', text: oldLines[oldIndex] });
            oldIndex++;
          }
          if (newIndex < newLines.length) {
            result.push({ type: 'added', text: newLines[newIndex] });
            newIndex++;
          }
        }
      }
    }

    return result;
  }, [oldText, newText]);

  return (
    <pre className="text-sm bg-gray-50 p-3 rounded-md whitespace-pre-wrap font-sans">
      {diff.map((line, index) => {
        let classes = '';
        let prefix = '';
        switch (line.type) {
          case 'added':
            classes = 'bg-green-100 text-green-800';
            prefix = '+ ';
            break;
          case 'removed':
            classes = 'bg-red-100 text-red-800';
            prefix = '- ';
            break;
          default:
            classes = 'text-gray-600';
            prefix = '  ';
            break;
        }
        return (
          <div key={index} className={classes}>
            <span>{prefix}</span>
            <span>{line.text}</span>
          </div>
        );
      })}
    </pre>
  );
};

export default DiffViewer;