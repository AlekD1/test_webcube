import { FC, ReactElement } from 'react';
import { ModelRigidBody } from './RigidBody';

interface IProps {
  children: ReactElement[];
}

export const Modify: FC<IProps> = ({ children }) =>
  children.map((child, i) => (
    <ModelRigidBody key={child.key || i}>
      {child}
    </ModelRigidBody>
  ));
