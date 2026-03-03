import Modal from "./Modal.tsx";
import classes from "./Confirm.module.css";
import {Link} from "react-router-dom";

export default function Confirm({itemName, onConfirm, onCancel, isOpen}: {
    itemName: string,
    onConfirm: () => void,
    onCancel: () => void,
    isOpen: boolean
}) {
    if (!isOpen) return null;

    return (
        <Modal>
            <div className={classes.form}>
                <div>Are you sure you want to delete this {itemName}?</div>
                <p className={classes.actions}>
                    <Link to="" onClick={onCancel}>Cancel</Link>
                    <button className={classes.actions} onClick={onConfirm}>Confirm</button>
                </p>
            </div>
        </Modal>
    )
}