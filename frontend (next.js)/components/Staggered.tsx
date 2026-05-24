'use client';

import { ReactNode, Children } from 'react';

interface StaggeredProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'nav' | 'section' | 'ul' | 'ol' | 'tbody';
  delay?: number;
  stagger?: number;
}

export default function Staggered({
  children,
  className = '',
  as: Tag = 'div',
  delay = 50,
  stagger = 80,
}: StaggeredProps) {
  const childrenArray = Children.toArray(children);

  return (
    <Tag className={className}>
      {childrenArray.map((child, i) => {
        const animDelay = delay + i * stagger;
        return (
          <div
            key={i}
            style={{
              animation: `anim-fade-in-up 400ms cubic-bezier(0.16, 1, 0.3, 1) ${animDelay}ms both`,
            }}
          >
            {child}
          </div>
        );
      })}
    </Tag>
  );
}
