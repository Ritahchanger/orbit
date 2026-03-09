import { AlertCircle } from "lucide-react"

const TemplateInfor = ({selectedTemplate}) => {
    return (
        <div className="p-4 bg-blue-900/10 border border-blue-800/30 rounded-sm">
            <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-blue-400" />
                <div>
                    <p className="text-sm text-white">
                        Using template: <span className="font-medium">{selectedTemplate?.name}</span>
                    </p>
                    <p className="text-xs text-blue-300 mt-1">
                        This email will update the consultation status to "{selectedTemplate?.category === 'accept' ? 'accepted' : selectedTemplate?.category === 'decline' ? 'declined' : 'pending'}"
                    </p>
                </div>
            </div>
        </div>
    )
}

export default TemplateInfor