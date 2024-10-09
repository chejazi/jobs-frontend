function Modal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal">
      <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content">
        <div className="modal-close"></div>
      </div>
      </div>
    </div>
  );
}

export default Modal;
